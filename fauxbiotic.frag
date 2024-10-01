#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_buffer0;

// Conventions:
// x component = ring
// y component = disk

const float PI = 3.14159265;
const float dt = 0.30;

const vec2 r = vec2(21.0, 7.0);
const vec2 areas = vec2(PI * r.x * r.x - PI * r.y * r.y, PI * r.y * r.y);

const float b1 = 0.257;
const float b2 = 0.336;
const float d1 = 0.365;
const float d2 = 0.549;
const float alpha_n = 0.028;
const float alpha_m = 0.147;

float random(vec2 coords) {
    return fract(sin(dot(coords.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}

float logistic(float x, float a, float alpha) {
    return 1.0 / (1.0 + exp(-(x - a) * 4.0 / alpha));
}

float is_between(float x, float min, float max) {
    return logistic(x, min, alpha_n) * (1.0 - logistic(x, max, alpha_n));
}

float dead_or_alive(float x, float dead, float alive) {
    return dead * (1.0 - logistic(x, 0.5, alpha_m)) + alive * logistic(x, 0.5, alpha_m);
}

float transition_function(vec2 neighbors) {
    return dead_or_alive(neighbors.y,
        is_between(neighbors.x, b1, b2),
        is_between(neighbors.x, d1, d2));
}

float lerp(float min, float max, float val) {
    if (val < min) {
        return 1.0;
    } else if (val > max) {
        return 0.0;
    } else {
        return (val - min) / (max - min);
    }
}

vec2 convolve(vec2 coords) {
    // result.x is the ring weight
    // result.y is the disk weight
    vec2 result = vec2(0.0);
    for (float dx = -r.x; dx <= r.x; dx++) {
        for (float dy = -r.x; dy <= r.x; dy++) {
            vec2 offset = vec2(dx, dy);
            float dist = length(offset);
            vec2 buffer_pos = fract(coords + offset / u_resolution);
            float weight = texture2D(u_buffer0, buffer_pos).x;
            result.x += weight * (1.0 - lerp(r.y - 0.5, r.y + 0.5, dist)) * lerp(r.x - 0.5, r.x + 0.5, dist);	
            result.y += weight * lerp(r.y - 0.5, r.y + 0.5, dist);
        }
    }
    return result / areas;
}

void main() {
	vec2 coords = gl_FragCoord.xy / u_resolution;

#if defined( BUFFER_0 )
    // This is the texture buffer
    vec3 color = vec3(0.0);
    
    if(u_time < 0.05) {
        color = vec3(random(coords));
    } else {
        color.x = texture2D(u_buffer0, coords).x +
            dt * (2.0 * transition_function(convolve(coords)) - 1.0);
        color = clamp(color, 0.0, 1.0);
    }
	gl_FragColor = vec4(color, 1.0);

#else
    // This is the output image
    vec3 color = vec3(texture2D(u_buffer0, coords).x);
	gl_FragColor = vec4(color, 1.0);

#endif
}

#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_buffer0;

const float PI = 3.14159;
const float E = 2.71828;

const float r_a = 21.0;
const float r_b = 7.0;
const float b1 = 0.257;
const float b2 = 0.336;
const float d1 = 0.365;
const float d2 = 0.549;
const float alpha_n = 0.028;
const float alpha_m = 0.147;
const float dt = 0.30;

const float area_a = PI * r_a * r_a - PI * r_b * r_b;
const float area_b = PI * r_b * r_b;

float rand(vec2 coords) {
    return fract(sin(dot(coords, vec2(12.9898,78.233))) * 43758.5453);
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

vec2 convolve(vec2 coords) {
    // result.x is the ring weight
    // result.y is the disk weight
    vec2 result = vec2(0.0);
    for (float dx = -r_a; dx <= r_a; dx++) {
        for (float dy = -r_a; dy <= r_a; dy++) {
            vec2 offset = vec2(dx, dy);
            float dist = length(offset);
            vec2 buffer_pos = fract(coords + offset / u_resolution);
            float weight = texture2D(u_buffer0, buffer_pos).x;
            result.x += weight * logistic(dist, r_b, E) * (1.0 - logistic(dist, r_a, E));
            result.y += weight * (1.0 - logistic(dist, r_b, E));
        }
    }
    return result / vec2(area_a, area_b);
}

void main() {
	vec2 coords = gl_FragCoord.xy / u_resolution;

#if defined( BUFFER_0 )
    // This is the texture buffer
    vec3 color = vec3(0.0);
    
    if(u_time < dt) {
        color = vec3(rand(coords));
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

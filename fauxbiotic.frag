#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_buffer0;

// Conventions:
// x component = outer radius / ring
// y component = inner radius / disk

const float PI = 3.14159265;
const float dt = 0.30;

const vec2 r = vec2(20.0, 20.0 / 3.0);
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

float transition_function(vec2 disk_ring) {
    return dead_or_alive(disk_ring.y,
        is_between(disk_ring.x, b1, b2),
        is_between(disk_ring.x, d1, d2));
}

// unnecessary (?)
float ramp_step(float radius, float dist) {
    return clamp(0.5 + dist - radius, 0.0, 1.0);
}

// Computes both inner and outer integrals
// TODO: Optimize. Much redundant computation. Most expensive part of program.
vec2 convolve(vec2 coords) {
    // result.x is the disk weight
    // result.y is the ring weight
    vec2 result = vec2(0.0);
    for (float dx = -r.x; dx <= r.x; dx++) {
        for (float dy = -r.x; dy <= r.x; dy++) {
            vec2 d = vec2(dx, dy);
            float dist = length(d);
            vec2 buffer_coords = fract(coords + d / u_resolution);
            //if(dist <= r.y + 1.0) {
                float weight = texture2D(u_buffer0, buffer_coords).x;
            	result.x += weight * ramp_step(r.y, dist) * (1.0-ramp_step(r.x, dist));	
            	
            //} else if(dist <= r.x + 1.) {
                //float weight = texture(iChannel0, uv+offset).x;
				result.y += weight * (1.0-ramp_step(r.y, dist));
            //}
        }
    }
    return result;
}

void main() {
	vec2 coords = gl_FragCoord.xy / u_resolution;

#if defined( BUFFER_0 )
    // This is the texture buffer
    vec3 color = vec3(0.0);
    
    if(u_time < 0.05) {
        // Initial conditions
        color = vec3(random(coords));

    } else {
        // r.x is the outer circle, r.y is the inner disk
        // area.x is the outer ring, area.y is the inner disk
        vec2 area = PI * r * r;
        area.x -= area.y;
        vec2 normalized_convolution = convolve(coords) / area;
        color.x = texture2D(u_buffer0, coords).x + dt * (2.0 * transition_function(normalized_convolution) - 1.0);
        color = clamp(color, 0.0, 1.0);
    }

	gl_FragColor = vec4(color, 1.0);

#else
    // This is the output image
    vec3 color = vec3(texture2D(u_buffer0, coords).x);

	gl_FragColor = vec4(color, 1.0);

#endif
}

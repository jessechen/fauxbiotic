#ifdef GL_ES
    precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

uniform sampler2D u_buffer0;
uniform sampler2D u_tex0; // data/moon.jpg


//Conventions:
// x component = outer radius / ring
// y component = inner radius / disk
/*
   _
 /   \
|  O  |
 \ _ /
*/
const float PI = 3.14159265;
const float dt = 0.30;

const vec3 CellColor = vec3(0.2, 0.2, 0.2);
const vec3 RingColor = vec3(0.0, 0.2, 0.2);
const vec3 DiskColor = vec3(0.0, 0.0, 0.0);

const vec2 r = vec2(10.0, 3.0);

// SmoothLifeL rules
const float b1 = 0.257;
const float b2 = 0.336;
const float d1 = 0.365;
const float d2 = 0.549;

const float alpha_n = 0.028;
const float alpha_m = 0.147;
/*------------------------------*/

// 1 out, 3 in... <https://www.shadertoy.com/view/4djSRW>
#define MOD3 vec3(.1031,.11369,.13787)
float hash13(vec3 p3) {
	p3 = fract(p3 * MOD3);
    p3 += dot(p3, p3.yzx+19.19);
    return fract((p3.x + p3.y)*p3.z);
}


/* ---------------- Sigmoid functions ------------------------------------ */

// TODO: reduce unnecessary parameters (remove arguments, use global consts)

float sigmoid_a(float x, float a, float b) {
    return 1.0 / (1.0 + exp(-(x - a) * 4.0 / b));
}

// unnecessary 
float sigmoid_b(float x, float b, float eb) {
    return 1.0 - sigmoid_a(x, b, eb);
}

float sigmoid_ab(float x, float a, float b, float ea, float eb) {
    return sigmoid_a(x, a, ea) * sigmoid_b(x, b, eb);
}

float sigmoid_mix(float x, float y, float m, float em) {
    return x * (1.0 - sigmoid_a(m, 0.5, em)) + y * sigmoid_a(m, 0.5, em);
}

/* ----------------------------------------------------------------------- */

// SmoothLifeL
float transition_function(vec2 disk_ring) {
    return sigmoid_mix(sigmoid_ab(disk_ring.x, b1, b2, alpha_n, alpha_n),
                       sigmoid_ab(disk_ring.x, d1, d2, alpha_n, alpha_n), disk_ring.y, alpha_m
                      );
}

// unnecessary (?)
float ramp_step(float steppos, float t) {
    return clamp(t-steppos+0.5, 0.0, 1.0);
}

// unnecessary
vec2 wrap(vec2 position) { return fract(position); }

// Computes both inner and outer integrals
// TODO: Optimize. Much redundant computation. Most expensive part of program.
vec2 convolve(vec2 uv) {
    vec2 result = vec2(0.0);
    for (float dx = -r.x; dx <= r.x; dx++) {
        for (float dy = -r.x; dy <= r.x; dy++) {
            vec2 d = vec2(dx, dy);
            float dist = length(d);
            vec2 offset = d / u_resolution.xy;
            vec2 samplepos = wrap(uv + offset);
            //if(dist <= r.y + 1.0) {
                float weight = texture2D(u_buffer0, samplepos).x;
            	result.x += weight * ramp_step(r.y, dist) * (1.0-ramp_step(r.x, dist));	
            	
            //} else if(dist <= r.x + 1.) {
                //float weight = texture(iChannel0, uv+offset).x;
				result.y += weight * (1.0-ramp_step(r.y, dist));
            //}
        }
    }
    return result;
}

vec3 hslToRgb(vec3 channels, vec2 coords) {
    vec3 k = mod(channels + (coords.x * 12.0), 12.0);
    float a = 1.0 * min(coords.y, 1.0 - coords.y);
    return coords.y - a * clamp(min(k - 3.0, 9.0 - k), -1.0, 1.0);
}

void main() {
	vec2 coords = gl_FragCoord.xy / u_resolution.xy;
    vec3 diff = vec3( vec2(1.0) / u_resolution.xy, 0.0);

#if defined( BUFFER_0 )
    // Buffer
    vec3 color = vec3(0.0);
    
    // Compute inner disk and outer ring area.
    vec2 area = PI * r * r;
    area.x -= area.y;
    /* -------------------------------------*/
    
    // TODO: Cleanup.
    color = texture2D(u_buffer0, coords).xyz;
    vec2 normalized_convolution = convolve(coords.xy).xy / area;
    color.x = color.x + dt * (2.0 * transition_function(normalized_convolution) - 1.0);
    color.yz = normalized_convolution;
    color = clamp(color, 0.0, 1.0);
    
    // Set initial conditions. TODO: Move to function / cleanup
    if(u_time < 0.1) {
        color = vec3(hash13(vec3(gl_FragCoord.xy, u_time)) - texture2D(u_tex0, coords).x + 0.5);
    }

	gl_FragColor = vec4(color, 1.0);

#else
    // Image
    vec4 buffer = texture2D(u_buffer0, coords);
    
    vec3 color = 1.0*(buffer.x * CellColor + buffer.y * RingColor + buffer.z * DiskColor);
    
    float c = 1.0 - buffer.z;
    float c2 = 1. - texture2D(u_buffer0, coords + .5/u_resolution.xy).y;
    color += vec3(.6, .85, 1.)*max(c2*c2 - c*c, 0.)*4.;
    
	gl_FragColor = vec4(color, 1.0);

#endif

}

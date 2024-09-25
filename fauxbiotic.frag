#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

vec3 hslToRgb(vec3 channels, vec2 coords) {
    vec3 k = mod(channels + (coords.x * 12.0), 12.0);
    float a = 1.0 * min(coords.y, 1.0 - coords.y);
    return coords.y - a * clamp(min(k - 3.0, 9.0 - k), -1.0, 1.0);
}

void main() {
	vec2 coords = gl_FragCoord.xy/u_resolution;
    float phase = fract(u_time / 5.0);
    float x = fract(coords.x + phase);
    vec3 color = hslToRgb(vec3(0.0, 8.0, 4.0), vec2(x, coords.y));
    gl_FragColor = vec4(color, 1.0);
}

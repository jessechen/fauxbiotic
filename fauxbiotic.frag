#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float qux(float n, float x) {
    float k = mod(n + (x * 12.0), 12.0);
    float a = 0.5 * min(0.5, 0.5);
    return 0.5 - a * max(-1.0, min(min(k - 3.0, 9.0 - k), 1.0));
}

void main() {
	vec2 coords = gl_FragCoord.xy/u_resolution;

    float red = qux(0.0, coords.x);
    float green = qux(8.0, coords.x);
    float blue = qux(4.0, coords.x);

    gl_FragColor = vec4(red, green, blue, 1.0);
}

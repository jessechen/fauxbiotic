#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

float qux(float n, float x, float y) {
    float k = mod(n + (x * 12.0), 12.0);
    float a = 1.0 * min(y, 1.0 - y);
    return y - a * max(-1.0, min(min(k - 3.0, 9.0 - k), 1.0));
}

void main() {
	vec2 coords = gl_FragCoord.xy/u_resolution;

    float red = qux(0.0, coords.x, coords.y);
    float green = qux(8.0, coords.x, coords.y);
    float blue = qux(4.0, coords.x, coords.y);

    gl_FragColor = vec4(red, green, blue, 1.0);
}

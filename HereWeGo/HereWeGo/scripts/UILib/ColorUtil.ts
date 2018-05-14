/**
 * Some Color functions I stole from
 * {@link https://stackoverflow.com/questions/5560248/programmatically-lighten-or-darken-a-hex-color-or-rgb-and-blend-colors this fantstic StackOverflow post}.
 * Note: all hex color codes are #RRGGBB.
 */

namespace ColorUtil {
    /**
     * Shade(add white or black) a color by a percentage. 
     * @param color The hex color code
     * @param percent A number from -1 to 1, -1 being pure black
     * @returns A shaded hex color code
     */
    export const shadeColors = (color: string, percent: number): string => {
        var f = parseInt(color.slice(1), 16), t = percent < 0 ? 0 : 255, p = percent < 0 ? percent * -1 : percent, R = f >> 16, G = f >> 8 & 0x00FF, B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
    };

    /**
     * Blend one color with another by a percentage.
     * @param c0 The hex code of the color at 0% blending
     * @param c1 The hex code of the color at 100% blending
     * @param p The percantage to blend (0-1)
     * @returns A blended hex color code
     */
    export const blendColors = (c0: string, c1: string, p: number): string => {
        var f = parseInt(c0.slice(1), 16), t = parseInt(c1.slice(1), 16), R1 = f >> 16, G1 = f >> 8 & 0x00FF, B1 = f & 0x0000FF, R2 = t >> 16, G2 = t >> 8 & 0x00FF, B2 = t & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((R2 - R1) * p) + R1) * 0x10000 + (Math.round((G2 - G1) * p) + G1) * 0x100 + (Math.round((B2 - B1) * p) + B1)).toString(16).slice(1);
    }
}

export = ColorUtil;
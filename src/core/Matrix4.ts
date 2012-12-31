
///<reference path="Vector3.ts"/>

module volksoper{
    export class Matrix4{
        static IDENT: number[] = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
        ];

        static TMP: number[] = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];

        static TMP_MAT: Matrix4 = new Matrix4();

        m: number[] = [
                1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1
        ];



        constructor(m?: Matrix4){
            if(m){
                this.setValue(m);
            }
        }

        setValue(m: Matrix4){
            var s = this.m;
            var d = m.m;

            for(var n = 0;  n < 16; ++n){
                s[n] = d[n];
            }
        }

        translate(x: number, y: number, z: number): Matrix4{
            var m = this.m;

            m[12] += x;
            m[13] += y;
            m[14] += z;

            return this;
        }

        rotate(x: number, y: number, z: number): Matrix4{
            var m = Matrix4.TMP_MAT.m;
            Matrix4.TMP_MAT.identify();

            var cx = Math.cos(x);
            var cy = Math.cos(y);
            var cz = Math.cos(z);

            var sx = Math.sin(x);
            var sy = Math.sin(y);
            var sz = Math.sin(z);

            m[0] = cy*cz;
            m[1] = sx*sy*cz - cx*sz;
            m[2] = cx*sy*cz + sx*sz;

            m[4] = cy*sz;
            m[5] = sx*sy*sz + cx*cz;
            m[6] = cx*sy*sz - sx*cz;

            m[8] = -sy;
            m[9] = sx*cy;
            m[10] = cx*cz;

            return this.multiply(Matrix4.TMP_MAT);
        }

        multiply (m: Matrix4): Matrix4{
            var ma: number[] = this.m;
            var mb: number[] = m.m;
            var tmp: number[] = Matrix4.TMP;
            
            tmp[0] = ma[0] * mb[0] + ma[4] * mb[1] + ma[8] * mb[2] + ma[12] * mb[3];
            tmp[4] = ma[0] * mb[4] + ma[4] * mb[5] + ma[8] * mb[6] + ma[12] * mb[7];
            tmp[8] = ma[0] * mb[8] + ma[4] * mb[9] + ma[8] * mb[10] + ma[12] * mb[11];
            tmp[12] = ma[0] * mb[12] + ma[4] * mb[13] + ma[8] * mb[14] + ma[12] * mb[15];
            tmp[1] = ma[1] * mb[0] + ma[5] * mb[1] + ma[9] * mb[2] + ma[13] * mb[3];
            tmp[5] = ma[1] * mb[4] + ma[5] * mb[5] + ma[9] * mb[6] + ma[13] * mb[7];
            tmp[9] = ma[1] * mb[8] + ma[5] * mb[9] + ma[9] * mb[10] + ma[13] * mb[11];
            tmp[13] = ma[1] * mb[12] + ma[5] * mb[13] + ma[9] * mb[14] + ma[13] * mb[15];
            tmp[2] = ma[2] * mb[0] + ma[6] * mb[1] + ma[10] * mb[2] + ma[14] * mb[3];
            tmp[6] = ma[2] * mb[4] + ma[6] * mb[5] + ma[10] * mb[6] + ma[14] * mb[7];
            tmp[10] = ma[2] * mb[8] + ma[6] * mb[9] + ma[10] * mb[10] + ma[14] * mb[11];
            tmp[14] = ma[2] * mb[12] + ma[6] * mb[13] + ma[10] * mb[14] + ma[14] * mb[15];
            tmp[3] = ma[3] * mb[0] + ma[7] * mb[1] + ma[11] * mb[2] + ma[15] * mb[3];
            tmp[7] = ma[3] * mb[4] + ma[7] * mb[5] + ma[11] * mb[6] + ma[15] * mb[7];
            tmp[11] = ma[3] * mb[8] + ma[7] * mb[9] + ma[11] * mb[10] + ma[15] * mb[11];
            tmp[15] = ma[3] * mb[12] + ma[7] * mb[13] + ma[11] * mb[14] + ma[15] * mb[15];
            
            for(var n = 0; n < 16; ++n){
                ma[n] = tmp[n]
            }

            return this;
        }

        multiplyVector(i: Vector3, o: Vector3): Vector3{
            var m = this.m;

            o.x = i.x*m[0] + i.y*m[1] + i.z*m[2] + m[3];
            o.y = i.x*m[4] + i.y*m[5] + i.z*m[6] + m[7];
            o.z = i.x*m[8] + i.y*m[9] + i.z*m[10] + m[11];

            return o;
        }

        transpose(m: Matrix4): Matrix4{
            var ma: number[] = this.m;
            var mb: number[] = m.m;
            var tmp: number[] = Matrix4.TMP;
            
            tmp[0] = mb[0];
            tmp[4] = mb[1];
            tmp[8] = mb[2];
            tmp[12] = mb[3];
            tmp[1] = mb[4];
            tmp[5] = mb[5];
            tmp[9] = mb[6];
            tmp[13] = mb[7];
            tmp[2] = mb[8];
            tmp[6] = mb[9];
            tmp[10] = mb[10];
            tmp[14] = mb[11];
            tmp[3] = mb[12];
            tmp[7] = mb[13];
            tmp[11] = mb[14];
            tmp[15] = mb[15];


            for(var n = 0; n < 16; ++n){
                ma[n] = tmp[n]
            }
            
            return this;
        }

        identify(): Matrix4{
            var m: number[] = this.m;

            m[0] = 1;
            m[4] = 0;
            m[8] = 0;
            m[12] = 0;
            m[1] = 0;
            m[5] = 1;
            m[9] = 0;
            m[13] = 0;
            m[2] = 0;
            m[6] = 0;
            m[10] = 1;
            m[14] = 0;
            m[3] = 0;
            m[7] = 0;
            m[11] = 0;
            m[15] = 1;

            return this;
        }


        invert(): bool {
            var tmp = Matrix4.TMP;
            var m = this.m;
            
            var l_det = m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5]
                    * m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1]
                    * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13]
                    + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11]
                    * m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7]
                    * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1]
                    * m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15]
                    + m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9]
                    * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
            if (l_det == 0) return false;
            var inv_det = 1.0 / l_det;
            tmp[0] = m[9] * m[14] * m[7] - m[13] * m[10] * m[7] + m[13] * m[6] * m[11] - m[5]
                    * m[14] * m[11] - m[9] * m[6] * m[15] + m[5] * m[10] * m[15];
            tmp[4] = m[12] * m[10] * m[7] - m[8] * m[14] * m[7] - m[12] * m[6] * m[11] + m[4]
                    * m[14] * m[11] + m[8] * m[6] * m[15] - m[4] * m[10] * m[15];
            tmp[8] = m[8] * m[13] * m[7] - m[12] * m[9] * m[7] + m[12] * m[5] * m[11] - m[4]
                    * m[13] * m[11] - m[8] * m[5] * m[15] + m[4] * m[9] * m[15];
            tmp[12] = m[12] * m[9] * m[6] - m[8] * m[13] * m[6] - m[12] * m[5] * m[10] + m[4]
                    * m[13] * m[10] + m[8] * m[5] * m[14] - m[4] * m[9] * m[14];
            tmp[1] = m[13] * m[10] * m[3] - m[9] * m[14] * m[3] - m[13] * m[2] * m[11] + m[1]
                    * m[14] * m[11] + m[9] * m[2] * m[15] - m[1] * m[10] * m[15];
            tmp[5] = m[8] * m[14] * m[3] - m[12] * m[10] * m[3] + m[12] * m[2] * m[11] - m[0]
                    * m[14] * m[11] - m[8] * m[2] * m[15] + m[0] * m[10] * m[15];
            tmp[9] = m[12] * m[9] * m[3] - m[8] * m[13] * m[3] - m[12] * m[1] * m[11] + m[0]
                    * m[13] * m[11] + m[8] * m[1] * m[15] - m[0] * m[9] * m[15];
            tmp[13] = m[8] * m[13] * m[2] - m[12] * m[9] * m[2] + m[12] * m[1] * m[10] - m[0]
                    * m[13] * m[10] - m[8] * m[1] * m[14] + m[0] * m[9] * m[14];
            tmp[2] = m[5] * m[14] * m[3] - m[13] * m[6] * m[3] + m[13] * m[2] * m[7] - m[1]
                    * m[14] * m[7] - m[5] * m[2] * m[15] + m[1] * m[6] * m[15];
            tmp[6] = m[12] * m[6] * m[3] - m[4] * m[14] * m[3] - m[12] * m[2] * m[7] + m[0]
                    * m[14] * m[7] + m[4] * m[2] * m[15] - m[0] * m[6] * m[15];
            tmp[10] = m[4] * m[13] * m[3] - m[12] * m[5] * m[3] + m[12] * m[1] * m[7] - m[0]
                    * m[13] * m[7] - m[4] * m[1] * m[15] + m[0] * m[5] * m[15];
            tmp[14] = m[12] * m[5] * m[2] - m[4] * m[13] * m[2] - m[12] * m[1] * m[6] + m[0]
                    * m[13] * m[6] + m[4] * m[1] * m[14] - m[0] * m[5] * m[14];
            tmp[3] = m[9] * m[6] * m[3] - m[5] * m[10] * m[3] - m[9] * m[2] * m[7] + m[1]
                    * m[10] * m[7] + m[5] * m[2] * m[11] - m[1] * m[6] * m[11];
            tmp[7] = m[4] * m[10] * m[3] - m[8] * m[6] * m[3] + m[8] * m[2] * m[7] - m[0]
                    * m[10] * m[7] - m[4] * m[2] * m[11] + m[0] * m[6] * m[11];
            tmp[11] = m[8] * m[5] * m[3] - m[4] * m[9] * m[3] - m[8] * m[1] * m[7] + m[0]
                    * m[9] * m[7] + m[4] * m[1] * m[11] - m[0] * m[5] * m[11];
            tmp[15] = m[4] * m[9] * m[2] - m[8] * m[5] * m[2] + m[8] * m[1] * m[6] - m[0]
                    * m[9] * m[6] - m[4] * m[1] * m[10] + m[0] * m[5] * m[10];
            m[0] = tmp[0] * inv_det;
            m[4] = tmp[4] * inv_det;
            m[8] = tmp[8] * inv_det;
            m[12] = tmp[12] * inv_det;
            m[1] = tmp[1] * inv_det;
            m[5] = tmp[5] * inv_det;
            m[9] = tmp[9] * inv_det;
            m[13] = tmp[13] * inv_det;
            m[2] = tmp[2] * inv_det;
            m[6] = tmp[6] * inv_det;
            m[10] = tmp[10] * inv_det;
            m[14] = tmp[14] * inv_det;
            m[3] = tmp[3] * inv_det;
            m[7] = tmp[7] * inv_det;
            m[11] = tmp[11] * inv_det;
            m[15] = tmp[15] * inv_det;
            return true;
        }

        determinant(): number{
            var m = this.m;
            
            return m[3] * m[6] * m[9] * m[12] - m[2] * m[7] * m[9] * m[12] - m[3] * m[5]
                    * m[10] * m[12] + m[1] * m[7] * m[10] * m[12] + m[2] * m[5] * m[11] * m[12] - m[1]
                    * m[6] * m[11] * m[12] - m[3] * m[6] * m[8] * m[13] + m[2] * m[7] * m[8] * m[13]
                    + m[3] * m[4] * m[10] * m[13] - m[0] * m[7] * m[10] * m[13] - m[2] * m[4] * m[11]
                    * m[13] + m[0] * m[6] * m[11] * m[13] + m[3] * m[5] * m[8] * m[14] - m[1] * m[7]
                    * m[8] * m[14] - m[3] * m[4] * m[9] * m[14] + m[0] * m[7] * m[9] * m[14] + m[1]
                    * m[4] * m[11] * m[14] - m[0] * m[5] * m[11] * m[14] - m[2] * m[5] * m[8] * m[15]
                    + m[1] * m[6] * m[8] * m[15] + m[2] * m[4] * m[9] * m[15] - m[0] * m[6] * m[9]
                    * m[15] - m[1] * m[4] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
        }

        projection(near: number, far: number, fov: number, aspect: number): Matrix4{
            var m = this.m;
            this.identify();
            
            var fd = 1.0 / Math.tan((fov * (Math.PI / 180)) / 2.0);
            var a1 = (far + near) / (near - far);
            var a2 = (2 * far * near) / (near - far);
            m[0] = fd / aspect;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = fd;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = a1;
            m[11] = -1;
            m[12] = 0;
            m[13] = 0;
            m[14] = a2;
            m[15] = 0;

            
            return this;
        }

        viewport(width: number, height: number): Matrix4{
            var m = this.m;
            this.identify();

            m[0] = width / 2;
            m[5] = -height / 2;
            m[12] = width / 2;
            m[13] = height / 2;

            return this;
        }
        
        ortho(left: number, right: number, bottom: number, top: number, near: number, far: number){
            var m = this.m;
            this.identify();
          
            var x_orth = 2 / (right - left);
            var  y_orth = 2 / (top - bottom);
            var  z_orth = -2 / (far - near);

            var tx = -(right + left) / (right - left);
            var ty = -(top + bottom) / (top - bottom);
            var tz = -(far + near) / (far - near);

            m[0] = x_orth;
            m[1] = 0;
            m[2] = 0;
            m[3] = 0;
            m[4] = 0;
            m[5] = y_orth;
            m[6] = 0;
            m[7] = 0;
            m[8] = 0;
            m[9] = 0;
            m[10] = z_orth;
            m[11] = 0;
            m[12] = tx;
            m[13] = ty;
            m[14] = tz;
            m[15] = 1;
        }

        scale(x: number, y: number, z: number): Matrix4{
            var m = this.m;

            m[0] *= x;
            m[5] *= y;
            m[10] *= z;

            return this;
        }
    }
}
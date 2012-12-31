
module volksoper{
    export class Vector3{
        constructor(public x?: number, public y?: number, public z?: number){
            this.x = x || 0;
            this.y = y || 0;
            this.z = z || 0;
        }

        normalize(): bool{
            var len = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            if(len === 0){
                return false;
            }

            this.x /= len;
            this.y /= len;
            this.z /= len;

            return true;
        }

        length(): number{
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        }

        dot(v: Vector3): number{
            return this.x * v.x + this.y * v.y + this.z * v.z;
        }

        cross(a: Vector3, b: Vector3): Vector3{
            this.x = a.y * b.z - a.z * b.y;
            this.y = a.z * b.x - a.x * b.z;
            this.z = a.x * b.y - a.y * b.x;

            return this;
        }
    }
}
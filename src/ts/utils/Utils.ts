import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { BabylonViewer } from "../gui/BabylonViewer";
import { RealityBoxCollab } from "../RealityboxCollab";

export class Utils {

    /**
     * Determines whether the current device is mobile. This is used to check whether AR is available
     */
    static readonly isMobile: boolean = /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4));

    private static dummy: BABYLON.AbstractMesh;

    /**
     * Only _x, _y and _z will be exchanged via yjs
     * @param vec The vector exchanged via yjs
     * @returns A proper Vector3 instance
     */
    static createVector(vec: BABYLON.Vector3): BABYLON.Vector3 {
        return new BABYLON.Vector3(vec._x, vec._y, vec._z);
    }

    /**
     * Checks whether two vectors are component wise equal. This also works when the vectors are not complete because it was send over yjs.
     * @param a The first vector
     * @param b The second vector
     * @returns true, if a is equal to b
     */
    static vectorEquals(a: BABYLON.Vector3, b: BABYLON.Vector3): boolean {
        return a._x == b._x && a._y == b._y && a._z == b._z;
    }

    /**
     * Just as {@link Utils.createVector} this method create a quaternion instance from a uncompleted quaternion exchanged via yjs.
     * @param q The uncompleted quaternion
     * @returns A complete quaternion instance
     */
    static createQuaternion(q: BABYLON.Quaternion): BABYLON.Quaternion {
        return new BABYLON.Quaternion(q._x, q._y, q._z, q._w);
    }

    /**
     * Checks whether two quaternions are component wise equal. This also works when the quaternions are not complete because it was send over yjs.
     * @param a The first quaternion
     * @param b The second quaternion
     * @returns true, if a is equal to b
     */
    static quaternionEquals(a: BABYLON.Quaternion, b: BABYLON.Quaternion) {
        return a._x == b._x && a._y == b._y && a._z == b._z && a._w == b._w;
    }

    /**
     * Computes the component wise maximum vector from two vectors.
     * @param a The first vector
     * @param b The second vector
     * @returns A new vector whose components are the max of the two vectors components
     * @see {@link Utils.vectorMin}
     */
    static vectorMax(a: BABYLON.Vector3, b: BABYLON.Vector3): BABYLON.Vector3 {
        return new BABYLON.Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
    }

    /**
     * Computes the component wise minimum vector from two vectors.
     * @param a The first vector
     * @param b The second vector
     * @returns A new vector whose components are the min of the two vectors components
     * @see {@link Utils.vectorMax}
     */
    static vectorMin(a: BABYLON.Vector3, b: BABYLON.Vector3): BABYLON.Vector3 {
        return new BABYLON.Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
    }

    /**
     * Just as {@link Utils.createVector} this method create a color instance from a uncompleted color exchanged via yjs.
     * @param color The color exchanged via yjs
     * @returns A complete color instance
     */
    static createColor(color: BABYLON.Color3): BABYLON.Color3 {
        return new BABYLON.Color3(color.r, color.g, color.b);
    }

    /**
     * Computes the URL uses can use to join the room associated with the RealityboxCollab instance. The query parameters
     * 'viewer', 'room' and 'password' will be set. Other parameters will be preserved.
     * @param instance The RealityboxCollab instance
     * @returns The URL to join
     */
    static getJoinURL(instance: RealityBoxCollab): string {
        let uri = window.location.toString();
        // Remove # and ? (and whats behind)
        if (uri.indexOf('#') > 0) uri = uri.substring(0, uri.indexOf("#"));
        if (uri.indexOf('?') > 0) uri = uri.substring(0, uri.indexOf("?"));

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("viewer", instance.id);
        if (!instance.room.isLocal) {
            urlParams.set("room", encodeURIComponent(instance.room.roomInfo.name));
            urlParams.set("password", encodeURIComponent(instance.room.roomInfo.password));
        }
        else {
            urlParams.delete("room");
            urlParams.delete("password");
        }

        return uri + "?" + urlParams.toString();
    }

    static extractURLOptions(): URLJoinOptions {
        let uri = window.location.toString();
        let i = uri.indexOf("?");
        if (i > 0) {
            const urlParams = new URLSearchParams(window.location.search);
            let o: URLJoinOptions = {
                viewer: parseInt(urlParams.get('viewer')),
                room: urlParams.get('room'),
                password: urlParams.get('password')
            };

            return o.viewer == o.viewer && o.room != undefined ? o : null;
        }
        return null;
    }

    /**
     * Get the relative position to a node. This method is used to extract the relative position to the base node 
     * to make sure every tool etc is rendered at the same relative position for every user.
     * @param babylonViewer The babylonviewer instance
     * @param position The absolute position, which is to be converted
     * @returns The position relative to the origin of the node
     */
    static getRelativePosition(babylonViewer: BabylonViewer, position: BABYLON.Vector3): BABYLON.Vector3 {
        if (!Utils.dummy) {
            Utils.dummy = BABYLON.MeshBuilder.CreateSphere("pointerBall", {
                diameter: 0.05,
                updatable: true
            }, babylonViewer.scene);
            Utils.dummy.setEnabled(false);
        }
        Utils.dummy.setParent(null);
        Utils.dummy.position = new BABYLON.Vector3();
        Utils.dummy.setParent(babylonViewer.baseNode);
        Utils.dummy.setAbsolutePosition(position);
        return Utils.dummy.position;;
    }
}

export interface URLJoinOptions {
    viewer: number;
    room: string;
    password: string;
}
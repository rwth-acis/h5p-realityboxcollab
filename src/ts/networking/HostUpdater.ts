import { Room, User } from "./Room";

export class HostUpdater {
    timer: NodeJS.Timer;
    updateTimes: Map<string, number> = new Map();

    constructor(private room: Room) {
        this.timer = setInterval(() => this.update(), 5000);
    }

    update(): void {
        let toRemove: User[] = [];

        this.room.users.forEach(user => {
            // Check timeouts
            let old = this.updateTimes.get(user.username);
            if (old && user.lastUpdate) {
                if (old == user.lastUpdate) {
                    toRemove.push(user);
                }
            }
            this.updateTimes.set(user.username, user.lastUpdate);
        });

        toRemove.forEach(u => {
            this.room.users.delete(u.username);
            this.room.sendRoomMessage(`User ${u.username} lost connection`);
        });
    }

    clear(): void {
        clearInterval(this.timer);
    }
}
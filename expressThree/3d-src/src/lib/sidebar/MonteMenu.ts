import { MonteCarloManager } from "../algorithms/MonteCarlo.js";
import SceneManager from "../scene/SceneManager.ts";

export default class MonteMenu {
    scene: SceneManager
    monteManager: MonteCarloManager | null
    enabled: boolean = false;

    constructor(scene: SceneManager) {
        this.scene = scene;

        if (this.enabled) {
            this.monteManager = new MonteCarloManager(this.scene);
        }
        else {
            this.monteManager = null;
        }
        
    }
}
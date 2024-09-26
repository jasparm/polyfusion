import { GUI } from 'dat.gui';


// Could probably make this so it can create folders and stuff from a JSON but probably unnecessary.
// Basically just useful for development, should change it up for the final product.
export default class CustomGui {
    constructor(){
        this.gui = new GUI();
        this.lightingGui = new GUI();

        // Settings windows
        this.meshSettings = undefined;
        this.lightSettings = undefined;

        // Folders
        // Mesh Geometry
        this.geometryFolder = this.gui.addFolder('Mesh Geometry');
        this.rotationFolder = this.geometryFolder.addFolder('Rotation');
        this.scaleFolder = this.geometryFolder.addFolder('Scale');

        // Mesh material
        this.materialFolder = this.gui.addFolder('Mesh Material');

        // Lights
        this.ambient_light_folder = this.lightingGui.addFolder("Ambient Light");
        this.dlFolder = this.lightingGui.addFolder("Directional Light");

    }

    init_mesh(mesh) {
        this.rotationFolder.add(mesh.rotation, 'x', 0, Math.PI).name('Rotate X Axis');
        this.rotationFolder.add(mesh.rotation, 'y', 0, Math.PI).name('Rotate Y Axis');
        this.rotationFolder.add(mesh.rotation, 'z', 0, Math.PI).name('Rotate Z Axis');
        this.geometryFolder.open()

        this.scaleFolder.add(mesh.scale, 'x', 0, 2).name("Scale X Axis")
        this.scaleFolder.add(mesh.scale, 'y', 0, 2).name("Scale Y Axis")
        this.scaleFolder.add(mesh.scale, 'z', 0, 2).name("Scale Z Axis")

        const materialParams = {
          meshColor:  mesh.material.color.getHex(),
        };
        this.materialFolder.add(mesh.material, 'wireframe');
        this.materialFolder.addColor(materialParams, 'meshColor').onChange((value) => mesh.material.color.set(value));
        this.materialFolder.open();

    }

    init_ball(ball) {
        this.gui.add(ball.position, 'x', -3, 3)
    }

    init_monte(MonteCarloManager) {
        const monteFolder = this.gui.addFolder("Monte Carlo");
        
        const controls = {
            isToggled: false,
            reset: function() {
                MonteCarloManager.reset();
            }
        };

        monteFolder.add(controls, 'isToggled').name('Enabled').onChange(function(value){
            if (value) {
                MonteCarloManager.start(100, {min:-2, max:2}, {min:-1, max:1}, {min:-2, max:2});
            } else {
                MonteCarloManager.stop();
            }
        })

        monteFolder.add(controls, 'reset').name('Reset');

        monteFolder.open();
    }

    init_light(directional, ambient) {
        const dlSettings = {
            visible: true,
            colour: directional.color.getHex(),
          }

        this.dlFolder.add(dlSettings, 'visible').onChange((value) => {directional.visible = value;});
        this.dlFolder.add(directional, 'intensity', 0, 1, 0.25);
        this.dlFolder.add(directional.position, 'y', 1, 4, 0.5);
        this.dlFolder.add(directional.position, 'z', -4, 4, 0.5);
        this.dlFolder.add(directional, 'castShadow');
        this.dlFolder.addColor(dlSettings, 'colour').onChange((value) => directional.color.set(value));
        this.dlFolder.open();
          
        this.ambient_light_folder.add(ambient, 'visible');
        this.ambient_light_folder.add(ambient, 'intensity', 0, 1, 0.1);
        this.ambient_light_folder.open();

        return this.lightingGui;
    }

    destroy() {
        this.gui.destroy();
        this.lightingGui.destroy();
    }
}
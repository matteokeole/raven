import {GUIComposite, GUIRenderer} from "../src/gui/index.js";
import {DemoInstance} from "./DemoInstance.js";
import {DemoInstanceRenderer} from "./DemoInstanceRenderer.js";

const instanceRenderer = new DemoInstanceRenderer();
const instance = new DemoInstance(instanceRenderer);

instance.setParameter("current_scale", 1);
instance.setParameter("font_path", "assets/fonts/");
instance.setParameter("shader_path", "assets/shaders/");
instance.setParameter("texture_path", "assets/textures/");

const guiComposite = new GUIComposite({
	renderer: new GUIRenderer(),
	instance,
	fonts: {},
});

instance.setComposites([guiComposite]);

await instance.build();

document.body.appendChild(instance.getRenderer().getCanvas());

instance.loop();
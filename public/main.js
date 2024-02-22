import {GUIComposite, GUIRenderer} from "../src/gui/index.js";
import {TextureLoader} from "../src/Loader/index.js";
import {DemoInstance} from "./DemoInstance.js";
import {DemoInstanceRenderer} from "./DemoInstanceRenderer.js";

const instanceRenderer = new DemoInstanceRenderer();
const instance = new DemoInstance(instanceRenderer);

instance.setParameter("font_path", "assets/fonts/");
instance.setParameter("shader_path", "assets/shaders/");
instance.setParameter("texture_path", "assets/textures/");

const guiRenderer = new GUIRenderer();
const guiComposite = new GUIComposite({
	renderer: guiRenderer,
	instance,
	fonts: {},
});

instance.setComposites([guiComposite]);

await instance.build();

const textureLoader = new TextureLoader(instance.getParameter("texture_path"));
const textures = await textureLoader.load("textures.json");

guiRenderer.createTextureArray(textures, false);

document.body.appendChild(instance.getRenderer().getCanvas());

instance.loop();
import {WebGLRenderer} from "../src/index.js";
import {GUIComposite, GUIRenderer} from "../src/gui/index.js";
import {TextureLoader} from "../src/Loader/index.js";
import {DemoInstance} from "./DemoInstance.js";
import {DemoInstanceRenderer} from "./DemoInstanceRenderer.js";
import {DemoLayer} from "./Layer/DemoLayer.js";

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

const colors = textureLoader.loadColors([
	{
		name: "red",
		value: Uint8Array.of(255, 0, 0, 255),
	}, {
		name: "yellow",
		value: Uint8Array.of(255, 255, 0, 255),
	},
], WebGLRenderer.MAX_TEXTURE_SIZE);

guiRenderer.createTextureArray(textures.concat(colors), false);

document.body.appendChild(instance.getRenderer().getCanvas());

instance.loop();

guiComposite.push(new DemoLayer());
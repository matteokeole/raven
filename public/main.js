import {Instance, InstanceRenderer, WebGLRenderer} from "../src/index.js";
import {BitmapFont} from "../src/fonts/index.js";
import {GUIComposite, GUIRenderer} from "../src/gui/index.js";
import {TextureLoader} from "../src/Loader/index.js";
import {DemoLayer} from "./Layer/DemoLayer.js";

const instanceRenderer = new InstanceRenderer();
const instance = new Instance(instanceRenderer);

instance.setParameter("root_path", "src/");
instance.setParameter("font_path", "assets/fonts/");
instance.setParameter("texture_path", "assets/textures/");

const guiRenderer = new GUIRenderer();
const guiComposite = new GUIComposite({
	renderer: guiRenderer,
	instance,
	fonts: {
		quiver: new BitmapFont({
			glyphMapPath: "quiver.json",
			texturePath: "quiver.png",
			tileHeight: 12,
			tileSpacing: 1,
		}),
	},
});

instance.setComposites([guiComposite]);

await instance.build();

const textureLoader = new TextureLoader(instance.getParameter("texture_path"));
const textures = await textureLoader.load("textures.json");

const colors = textureLoader.loadColors([
	{
		name: "white",
		value: Uint8Array.of(255, 255, 255, 255),
	},
], WebGLRenderer.MAX_TEXTURE_SIZE);

guiRenderer.createTextureArray(textures.concat(colors), false);

document.body.appendChild(instance.getRenderer().getCanvas());

instance.loop();

guiComposite.push(new DemoLayer());
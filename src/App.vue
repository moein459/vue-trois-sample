<template>

  <Renderer shadow ref="renderer" :width="width" :height="height" alpha :orbit-ctrl="{ enableDamping: true, target }">

    <Camera :position="{ z: 400, x: 100, y: 100 }"/>

    <Scene ref="scene">

      <HemisphereLight/>

      <DirectionalLight
          ref="light"
          :position="{ x: 125, y: 200, z: 200 }"
          :rotation="{x: 30, y: 300, z: 30}"
          cast-shadow :shadow-camera="{ top: 180, bottom: -120, left: -120, right: 120 }"
      />

      <Group v-if="show">
        <FbxModel
            :scale="{x: .3, y: .3, z: .3}"
            :rotation="{y: 180}"
            :position="{ y: 0 }"
            src="/Grapple Guardian.fbx"
            @load="onload" />
      </Group>

    </Scene>

    <EffectComposer>
      <RenderPass />
      <SSAOPass :kernelRadius="12" :minDistance=".005" :maxDistance=".1"/>
      <UnrealBloomPass :strength=".15" />
    </EffectComposer>

  </Renderer>
</template>

<script>

import {
  AnimationMixer,
  Clock,
  Fog,
  GridHelper,
  Vector3,
  MeshPhongMaterial,
  TextureLoader,
  PlaneGeometry,
  ShadowMaterial,
  Mesh,
} from 'three'

export default {
  name: 'App',
  components: {},
  data() {
    return {
      target: new Vector3(0, 100, 0),
      mixer: null,
      clock: null,
      show: false,
      material: new MeshPhongMaterial(),
      width: (window.innerWidth - 7).toString(),
      height: (window.innerHeight - 7).toString()
    }
  },
  mounted() {

    const loader = new TextureLoader();
    loader.load('TXTR_04C16D65.png', texture1 => {
      this.material.map = texture1;

      loader.load('TXTR_CB2E1926.png', texture2 => {
        this.material.specularMap = texture2;

        this.show = true;
      });
    });


    const scene = this.$refs.scene.scene;
    const light = this.$refs.light.light;
    light.shadow.radius = 8;

    console.log(light);
    console.log(this.$refs.light)

    scene.fog = new Fog(0xa0a0a0, 100, 20000);

    const grid = new GridHelper(500, 10, 0xcccccc, 0xcccccc);
    grid.material.opacity = 0.1;
    grid.material.transparent = true;
    this.$refs.scene.add(grid);

    const geometry = new PlaneGeometry( 2000, 2000 );
    geometry.rotateX( - Math.PI / 2 );

    const material = new ShadowMaterial();
    material.opacity = .425;

    const plane = new Mesh( geometry, material );
    plane.receiveShadow = true;
    scene.add( plane );
  },
  methods: {
    onload(object) {

      object.children[2].material = this.material;

      this.mixer = new AnimationMixer(object);
      const action1 = this.mixer.clipAction(object.animations[1]);
      const action2 = this.mixer.clipAction(object.animations[2]);

      action1.play();
      action2.play();

      object.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.clock = new Clock();
      this.$refs.renderer.onBeforeRender(this.updateMixer);
    },
    updateMixer() {
      this.mixer.update(this.clock.getDelta());
    },
  }
}
</script>

<style>
html, body {
  min-height: 100vh;
  margin: 0;
}

body {
  background: #363636;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}

</style>

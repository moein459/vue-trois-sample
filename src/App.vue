<template>

  <Renderer
      shadow
      ref="renderer"
      alpha
      :resize="'true'"
      :orbit-ctrl="{ enableDamping: true, target }">

    <Camera :position="{ z: 15, x: 1, y: 1 }"/>

    <Scene ref="scene">

      <HemisphereLight/>

      <DirectionalLight
          :shadow-map-size="{ width: 1024, height: 1024 }"
          :intensity="1"
          ref="directionalLight"
          :position="{ x: 9, y: 15, z: 15 }"
          cast-shadow
      />

      <Group>
        <GltfModel
            :rotation="{y: 180}"
            src="/model/scene.gltf"
            @load="onload"/>
      </Group>

    </Scene>

    <EffectComposer>
      <RenderPass/>
      <SSAOPass :kernelRadius="12" :minDistance=".005" :maxDistance=".1"/>
      <UnrealBloomPass :strength=".15"/>
    </EffectComposer>

  </Renderer>
</template>

<script>

import {
  AnimationMixer,
  Clock,
  Fog,
  GridHelper,
  Mesh,
  MeshStandardMaterial,
  PlaneGeometry,
  ShadowMaterial,
  Vector3,
} from 'three'

export default {
  name: 'App',
  components: {},
  data() {
    return {
      target: new Vector3(0, 1, 0),
      mixer: null,
      clock: null,
      scene: null,
      renderer: null
    }
  },
  mounted() {
    this.renderer= this.$refs.renderer;
    this.scene = this.$refs.scene.scene;

    this.setLightRadius();
    this.addFog();
    this.addGrid();
    this.addShadowPlane();
  },
  methods: {
    setLightRadius() {
      this.$refs.directionalLight.light.shadow.radius = 12;
    },
    addFog() {
      this.scene.fog = new Fog(0xa0a0a0, 1, 120);
    },
    addGrid() {
      const grid = new GridHelper(10, 10, 0xcccccc, 0xcccccc);
      grid.material.opacity = 0.1;
      grid.material.transparent = true;
      this.$refs.scene.add(grid);
    },
    addShadowPlane() {
      const material = new ShadowMaterial();
      material.opacity = .425;

      const geometry = new PlaneGeometry(2000, 2000);
      geometry.rotateX(-Math.PI / 2);

      const plane = new Mesh(geometry, material);
      plane.receiveShadow = true;

      this.scene.add(plane);
    },
    onload(object) {
      this.fixMeshes(object);

      this.mixer = new AnimationMixer(object.scene);
      const action = this.mixer.clipAction(object.animations[0]);
      action.play();

      this.clock = new Clock();
      this.$refs.renderer.onBeforeRender(this.updateMixer);
    },
    fixMeshes(object) {
      object.scene.traverse(function (child) {
        if (child.isMesh) {
          const prevMaterial = child.material;
          child.material = new MeshStandardMaterial();
          child.material.map = prevMaterial.map;
          child.material.specularMap = prevMaterial.specularMap;

          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
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
  height: 100vh;
  overflow: hidden;
}

</style>

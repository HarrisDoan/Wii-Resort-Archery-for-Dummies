import { defs, tiny } from './examples/common.js';
// import { Shape_From_File } from './examples/obj-file-demo.js';
// import { Text_Line } from './examples/text-demo.js';
// import {Color_Phong_Shader, Shadow_Textured_Phong_Shader,
//     Depth_Texture_Shader_2D, Buffered_Texture, LIGHT_DEPTH_TEX_SIZE} from './examples/shadow-demo-shaders.js'

const {
  Vector,
  Vector3,
  vec,
  vec3,
  vec4,
  color,
  hex_color,
  Matrix,
  Mat4,
  Light,
  Shape,
  Shader,
  Texture,
  Material,
  Scene,
} = tiny;

export class Archery extends Scene {
  constructor() {
    super();

    // start toggle
    this.startgame = false;
    // pause toggle
    this.pause = false;
    //Is the arrow launched?
    this.launched = false;
    //Launch angle
    this.theta = Math.PI / 8;
    //Initial Velocity
    this.velocity = 20;
    //Gravity's acceleration
    this.gravity = -9.81;
    //Time launched
    this.launchtime = 0;

    this.targetMoving = 0;
    this.targetPosition = [0, 0, 30];

    //Sounds
    this.background_sound = new Audio('assets/crowd_noise.mp3'); //wind background noise like you're in a field
    this.bow_sound = new Audio('assets/bow_draw.mp3'); //Use the minecraft bow draw sound...
    this.hit_sound = new Audio('assets/hit_sound.mp3'); //Use the minecraft bow hit sound LOL, the loud "DING"
    this.game_music = new Audio('assets/background_music.mp3'); //Use Wii Sports background music

    //Initial Arrow Position
    this.arrow_init_x = 0;
    this.arrow_init_y = -3;
    this.arrow_init_z = 4.25;

    this.tangentAngle = this.theta;

    // Loading shapes onto GPU

    this.shapes = {
      // basic shapes
      square: new defs.Square(),
      cube: new defs.Cube(),
      circle: new defs.Regular_2D_Polygon(50, 50),
      sphere: new defs.Subdivision_Sphere(4),

      axis: new defs.Axis_Arrows(),

      sun: new defs.Subdivision_Sphere(4),

      player: new defs.Subdivision_Sphere(4),
      body: new defs.Cube(),
      bullseye: new defs.Surface_Of_Revolution(
        100,
        100,
        [vec3(1, 1, 0), vec3(0, 0, 0)],
        [
          [0, 100],
          [0, 100],
        ],
        2 * Math.PI
      ),
      middleRing: new defs.Surface_Of_Revolution(
        100,
        100,
        [vec3(2, 2, 0), vec3(1, 1, 0)],
        [
          [0, 100],
          [0, 100],
        ],
        2 * Math.PI
      ),
      outerRing: new defs.Surface_Of_Revolution(
        100,
        100,
        [vec3(3, 3, 0), vec3(2, 2, 0)],
        [
          [0, 100],
          [0, 100],
        ],
        2 * Math.PI
      ),

      shaft: new defs.Cylindrical_Tube(100, 100, [
        [0, 100],
        [0, 100],
      ]),

      //arrow_tip: new defs.Tetrahedron(true),

      plane: new defs.Square(),
      background: new defs.Cube(),
      tree: new defs.Cube(),
      leaves: new defs.Subdivision_Sphere(4),
    };

    // Materials

    this.materials = {
      sun: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#FFF9A6'),
      }), //Color of the sun being white in the sky
      player: new Material(new defs.Phong_Shader(), {
        ambient: 0,
        diffusivity: 1,
        color: hex_color('#FFFFFF'),
        specularity: 0,
      }),
      grass: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#10FF10'),
        specularity: 1,
      }),
      bullseye: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#FF0000'),
      }),
      middleRing: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#efd527'),
      }),
      outerRing: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0,
        color: hex_color('#1d6fe7'),
      }),

      shaft: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#541d07'),
        specularity: 0,
      }),

      tip: new Material(new defs.Phong_Shader(), {
          ambient: 0.7,
          diffusivity: 0.2,
          color: hex_color('#8a8282'),
          specularity: 0,
      }),

      axis: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#FFFFFF'),
        specularity: 0,
      }),
      sky: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#87CEEB'),
      }),

      wood: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#654321'),
      }),

      leaves: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#10FF10'),
        specularity: 1,
      }),
    };

    this.initial_camera_location = Mat4.look_at(
      vec3(0, 0, 0),
      vec3(0, 0, 1),
      vec3(0, 1, 0)
    );
  }

  make_control_panel() {
    // Start Control
    this.key_triggered_button('Start Game!', ['Enter'], () => {
      this.startgame =
        !this.startgame &&
        this.game_music.play() &&
        this.background_sound.play();
    });
    this.key_triggered_button('Pause Game!', ['Escape'], () => {
      this.pause =
        !this.pause && this.game_music.pause() && this.background_sound.pause();
    });

    //Player Control
    this.key_triggered_button('Draw Bow Back', ['b'], () => {
      this.launched = !this.launched;
    }); // Fill in Draw Bow Function

    this.key_triggered_button('Moving Target', ['n'], () => {
      if (this.targetMoving != 0) this.targetMoving = 0;
      else this.targetMoving = 1;
    });

    this.key_triggered_button('Angle Up', ['i'], () => {
      if (this.theta < Math.PI / 2 && !this.launched)
        this.theta = this.theta + Math.PI / 16;
    });

    this.key_triggered_button('Angle Down', ['k'], () => {
      if (this.theta > Math.PI / 8 && !this.launched)
        this.theta = this.theta - Math.PI / 16;
    });

    //
    //
    // // Extra Controls
    // this.key_triggered_button("Move Camera Left", ["Left Arrow"], () => this.attached = () => this.left_view);
    // this.new_line();
    // this.key_triggered_button("Move Camera Right", ["Right Arrow"], () => this.attached = () => this.right_view);
    // this.new_line();
    // this.key_triggered_button("View Player", ["P"], () => this.attached = () => this.initial_camera_location);       //Allows for camera to move to or return to player model
    // this.new_line();
    // this.key_triggered_button("View Target", ["V"], () => this.attached = () => this.target);       // Allows for camera to move to view the target
    // this.new_line();
  }

  draw_target(context, program_state, model_transform) {
    let target_transform = model_transform;

    if (this.targetMoving != 0) {
      if (this.targetMoving == 1) {
        this.targetPosition[2] = this.targetPosition[2] + 0.125;

        if (this.targetPosition[2] > 50) this.targetMoving = 2;
      }

      if (this.targetMoving == 2) {
        this.targetPosition[2] = this.targetPosition[2] - 0.125;

        if (this.targetPosition[2] < 20) this.targetMoving = 1;
      }
    } else {
      this.targetPosition[2] = 30;
    }

<<<<<<< HEAD
    target_transform = target_transform.times(Mat4.translation(this.targetPosition[0], this.targetPosition[1], this.targetPosition[2]));
    //.times(Mat4.rotation(90, 0,0,0));
=======
    target_transform = target_transform.times(
      Mat4.translation(
        this.targetPosition[0],
        this.targetPosition[1],
        this.targetPosition[2]
      )
    ); //.times(Mat4.rotation(90, 0,0,0));
>>>>>>> 5cf10e956a24a805f44d0cd0755131d0817ba88b
    this.shapes.bullseye.draw(
      context,
      program_state,
      target_transform,
      this.materials.bullseye
    );
    this.shapes.middleRing.draw(
      context,
      program_state,
      target_transform,
      this.materials.middleRing
    );
    this.shapes.outerRing.draw(
      context,
      program_state,
      target_transform,
      this.materials.outerRing
    );
  }

  draw_leaves(context, program_state, model_transform) {
    var leaves_radius = 2;
    let leaves1_transform = model_transform;
    leaves1_transform = leaves1_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(7, 2.1, 10));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves1_transform,
      this.materials.leaves
    );

    let leaves1a_transform = model_transform;
    leaves1a_transform = leaves1a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(6, 1.5, 10));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves1a_transform,
      this.materials.leaves
    );

    let leaves1b_transform = model_transform;
    leaves1b_transform = leaves1b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(8, 1.5, 10));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves1b_transform,
      this.materials.leaves
    );

    let leaves1c_transform = model_transform;
    leaves1c_transform = leaves1c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(7, 1.5, 9));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves1c_transform,
      this.materials.leaves
    );

    let leaves2_transform = model_transform;
    leaves2_transform = leaves2_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-6.5, 2.1, 7.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves2_transform,
      this.materials.leaves
    );

    let leaves2a_transform = model_transform;
    leaves2a_transform = leaves2a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-7.5, 1, 5, 7.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves2a_transform,
      this.materials.leaves
    );

    let leaves2b_transform = model_transform;
    leaves2b_transform = leaves2b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-5.5, 1.5, 7.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves2b_transform,
      this.materials.leaves
    );

    let leaves2c_transform = model_transform;
    leaves2c_transform = leaves2c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-6.5, 1.5, 6.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves2c_transform,
      this.materials.leaves
    );

    let leaves3_transform = model_transform;
    leaves3_transform = leaves3_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(7.5, 2.1, 5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves3_transform,
      this.materials.leaves
    );

    let leaves3a_transform = model_transform;
    leaves3a_transform = leaves3a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(6.5, 1.5, 5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves3a_transform,
      this.materials.leaves
    );

    let leaves3b_transform = model_transform;
    leaves3b_transform = leaves3b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(8.5, 1.5, 5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves3b_transform,
      this.materials.leaves
    );

    let leaves3c_transform = model_transform;
    leaves3c_transform = leaves3c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(7.5, 1.5, 4));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves3c_transform,
      this.materials.leaves
    );

    let leaves4_transform = model_transform;
    leaves4_transform = leaves4_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-7.5, 2.1, 4));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves4_transform,
      this.materials.leaves
    );

    let leaves4a_transform = model_transform;
    leaves4a_transform = leaves4a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-6.5, 1.5, 4));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves4a_transform,
      this.materials.leaves
    );

    let leaves4b_transform = model_transform;
    leaves4b_transform = leaves4b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-8.5, 1.5, 4));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves4b_transform,
      this.materials.leaves
    );

    let leaves4c_transform = model_transform;
    leaves4c_transform = leaves4c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-7.5, 1.5, 3));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves4c_transform,
      this.materials.leaves
    );

    let leaves5_transform = model_transform;
    leaves5_transform = leaves5_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-12.5, 2.1, 11));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves5_transform,
      this.materials.leaves
    );

    let leaves5a_transform = model_transform;
    leaves5a_transform = leaves5a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-13.5, 1.5, 11));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves5a_transform,
      this.materials.leaves
    );

    let leaves5b_transform = model_transform;
    leaves5b_transform = leaves5b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-11.5, 1.5, 11));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves5b_transform,
      this.materials.leaves
    );

    let leaves5c_transform = model_transform;
    leaves5c_transform = leaves5c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-12.5, 1.5, 10));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves5c_transform,
      this.materials.leaves
    );

    let leaves6_transform = model_transform;
    leaves6_transform = leaves6_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-5, 2.1, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves6_transform,
      this.materials.leaves
    );

    let leaves6a_transform = model_transform;
    leaves6a_transform = leaves6a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-4, 1.5, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves6a_transform,
      this.materials.leaves
    );

    let leaves6b_transform = model_transform;
    leaves6b_transform = leaves6b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-6, 1.5, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves6b_transform,
      this.materials.leaves
    );

    let leaves6c_transform = model_transform;
    leaves6c_transform = leaves6c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(-5, 1.5, 14));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves6c_transform,
      this.materials.leaves
    );

    let leaves7_transform = model_transform;
    leaves7_transform = leaves7_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(5, 2.1, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves7_transform,
      this.materials.leaves
    );

    let leaves7a_transform = model_transform;
    leaves7a_transform = leaves7a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(3, 1.5, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves7a_transform,
      this.materials.leaves
    );

    let leaves7b_transform = model_transform;
    leaves7b_transform = leaves7b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(4, 1.5, 15));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves7b_transform,
      this.materials.leaves
    );

    let leaves7c_transform = model_transform;
    leaves7c_transform = leaves7c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(5, 1.5, 14));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves7c_transform,
      this.materials.leaves
    );

    let leaves8_transform = model_transform;
    leaves8_transform = leaves8_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(15, 2.1, 12.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves8_transform,
      this.materials.leaves
    );

    let leaves8a_transform = model_transform;
    leaves8a_transform = leaves8a_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(14, 1.5, 12.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves8a_transform,
      this.materials.leaves
    );

    let leaves8b_transform = model_transform;
    leaves8b_transform = leaves8b_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(16, 1.5, 12.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves8b_transform,
      this.materials.leaves
    );

    let leaves8c_transform = model_transform;
    leaves8c_transform = leaves8c_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(15, 2.1, 11.5));
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves8c_transform,
      this.materials.leaves
    );
  }

  draw_trees(context, program_state, model_transform) {
    let tree1_transform = model_transform;
    tree1_transform = tree1_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(14, 0.3, 20));
    this.shapes.tree.draw(
      context,
      program_state,
      tree1_transform,
      this.materials.wood
    );

    let tree2_transform = model_transform;
    tree2_transform = tree2_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(-13, 0.3, 15));
    this.shapes.tree.draw(
      context,
      program_state,
      tree2_transform,
      this.materials.wood
    );

    let tree3_transform = model_transform;
    tree3_transform = tree3_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(15, 0.3, 10));
    this.shapes.tree.draw(
      context,
      program_state,
      tree3_transform,
      this.materials.wood
    );

    let tree4_transform = model_transform;
    tree4_transform = tree4_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(-15, 0.3, 8));
    this.shapes.tree.draw(
      context,
      program_state,
      tree4_transform,
      this.materials.wood
    );

    let tree5_transform = model_transform;
    tree5_transform = tree5_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(-25, 0.3, 22));
    this.shapes.tree.draw(
      context,
      program_state,
      tree5_transform,
      this.materials.wood
    );

    let tree6_transform = model_transform;
    tree6_transform = tree6_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(-10, 0, 30));
    this.shapes.tree.draw(
      context,
      program_state,
      tree6_transform,
      this.materials.wood
    );

    let tree7_transform = model_transform;
    tree7_transform = tree7_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(10, 0, 30));
    this.shapes.tree.draw(
      context,
      program_state,
      tree7_transform,
      this.materials.wood
    );

    let tree8_transform = model_transform;
    tree8_transform = tree8_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(30, 0, 25));
    this.shapes.tree.draw(
      context,
      program_state,
      tree8_transform,
      this.materials.wood
    );
  }

  display(context, program_state) {
    if (!context.scratchpad.controls) {
      this.children.push(
        (context.scratchpad.controls = new defs.Movement_Controls())
      );
      program_state.set_camera(this.initial_camera_location);
    }

    const t = program_state.animation_time / 1000,
      dt = program_state.animation_delta_time / 1000;
    let model_transform = Mat4.identity();

    let sun_transform = model_transform;
    var sun_radius = 5; //altered the sun radius because the more objects the more shadows, was looking a little dull
    sun_transform = sun_transform
      .times(Mat4.scale(sun_radius, sun_radius, sun_radius))
      .times(Mat4.translation(-10, 5, 8));

    const light_position = vec4(0, 10, 0, 1);
    program_state.lights = [
      new Light(light_position, color(1, 1, 1, 1), 10 ** sun_radius),
    ];

    //Draw Sun
    this.shapes.sun.draw(
      context,
      program_state,
      sun_transform,
      this.materials.sun
    );

    //Draw Grass Plane
    let plane_transform = model_transform;
    plane_transform = plane_transform
      .times(Mat4.translation(0, -5, 20))
      .times(Mat4.scale(80, 1, 40))
      .times(Mat4.rotation(90, 1, 0, 0));
    this.shapes.plane.draw(
      context,
      program_state,
      plane_transform,
      this.materials.grass
    );

    //Draw Sky background
    let background_transform = model_transform;
    background_transform = background_transform.times(
      Mat4.scale(100, 100, 100)
    );
    this.shapes.background.draw(
      context,
      program_state,
      background_transform,
      this.materials.sky
    );

    //Draw Target
    this.draw_target(context, program_state, model_transform);

    //Draw Player Head (can remove if you want)
    let player_transform = model_transform;
    player_transform = player_transform
      .times(Mat4.translation(1.5, -1.5, 4))
      .times(Mat4.scale(0.75, 0.75, 0.75));
    this.shapes.player.draw(
      context,
      program_state,
      player_transform,
      this.materials.player
    );

    //Draw Player Body
    let body_transform = model_transform;
    body_transform = body_transform
      .times(Mat4.translation(1.5, -3.5, 4))
      .times(Mat4.scale(0.75, 1.25, 0.75));
    this.shapes.body.draw(
      context,
      program_state,
      body_transform,
      this.materials.player
    );

    //Start of Drawing the Environment
    //Draw Tree Trunks in Background
    this.draw_trees(context, program_state, model_transform);

    //Draw Leaves
    this.draw_leaves(context, program_state, model_transform);

    //Draw and animate arrow
    var shaft_transform = model_transform;
    //var tip_transform = model_transform;

    if (this.launched) {
      let x = this.arrow_init_x;
      let y = this.arrow_init_y;
      let z = this.arrow_init_z;

      let delta = t - this.launchtime;

      z = z + this.velocity * Math.cos(this.theta) * delta;
      y =
        y +
        this.velocity * Math.sin(this.theta) * delta +
        0.5 * this.gravity * delta ** 2;

<<<<<<< HEAD
      //this.tangentAngle = Math.atan()
=======
      this.tangentAngle = Math.atan();
>>>>>>> 5cf10e956a24a805f44d0cd0755131d0817ba88b

      shaft_transform = shaft_transform
        .times(Mat4.translation(x, y, z))
        .times(Mat4.scale(0.125, 0.125, 1.25));
    } else {
      shaft_transform = shaft_transform
        .times(
          Mat4.translation(
            this.arrow_init_x,
            this.arrow_init_y,
            this.arrow_init_z
          )
        )
        .times(Mat4.scale(0.125, 0.125, 1.25));

      this.launchtime = t;
    }

    this.shapes.shaft.draw(context, program_state, shaft_transform, this.materials.shaft);
    //this.shapes.arrow_tip.draw(context, program_state, shaft_transform, this.materials.tip);

    //Draw Axis
    let axis_transform = model_transform;
    axis_transform = axis_transform.times(Mat4.translation(-5, -2, 5));
    this.shapes.axis.draw(
      context,
      program_state,
      axis_transform,
      this.materials.axis
    );

    program_state.projection_transform = Mat4.perspective(
      Math.PI / 2,
      context.width / context.height,
      0.1,
      500
    );
  }
}

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

//const {Textured_Phong} = defs

export class Archery extends Scene {
  constructor() {
    super();

    // start toggle
    this.startgame = false;
    // Is the arrow launched?
    this.launched = false;
    // Did the arrow hit the target?
    this.hit = false;
    // Did the arrow hit the grass?
    this.miss = false;
    // Launch angle
    this.theta = Math.PI / 8;
    // Initial Velocity
    this.velocity = 20;
    // Gravity's acceleration
    this.gravity = -9.81;
    // Time launched
    this.launchtime = 0;
    // Time arrow collides with something
    this.hittime = 0;
    // Scoring
    this.score = 0;

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

    //Initialize Arrow Scalings
    this.arrow_scale_x = 0.075;
    this.arrow_scale_y = 0.075;
    this.arrow_scale_z = 1.5;

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

      meter: new defs.Square(),

      //arrow_tip: new defs.Tetrahedron(true),

      plane: new defs.Square(),
      background: new defs.Cube(),
      tree: new defs.Cube(),
      leaves: new defs.Subdivision_Sphere(4),
      score: new defs.Square(),
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
      grass: new Material(new defs.Textured_Phong(), {
        color: hex_color('#29a929'),
        ambient: 0.4,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture('assets/grass.jpg'),
      }),
      bullseye: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#FF0000'),
      }),
      middleRing: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#efd527'),
      }),
      outerRing: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#1d6fe7'),
      }),

      shaft: new Material(new defs.Phong_Shader(), {
        ambient: 0.5,
        diffusivity: 0.5,
        color: hex_color('#541d07'),
        specularity: 0,
      }),

      meter: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 0.5,
        color: hex_color('#fde137'),
        specularity: 0.1,
      }),

      axis: new Material(new defs.Phong_Shader(), {
        ambient: 1,
        diffusivity: 1,
        color: hex_color('#FFFFFF'),
        specularity: 0,
      }),
      sky: new Material(new defs.Phong_Shader(), {
        color: hex_color('#87CEEB'),
        ambient: 1,
        diffusivity: 1,
        //   texture: new Texture("assets/cloud.jpg"),     Messing with texturing the sky lol, can remove
      }),
      sky_white: new Material(new defs.Phong_Shader(), {
        color: hex_color('#F0F0F0'),
        ambient: 1,
        diffusivity: 1,
      }),

      wood: new Material(new defs.Textured_Phong(), {
        color: hex_color('#654321'),
        ambient: 0.4,
        diffusivity: 0.5,
        specularity: 0.1,
        texture: new Texture('assets/wood.jpg'),
      }),

      leaves: new Material(new defs.Textured_Phong(), {
        color: hex_color('#10FF10'),
        specularity: 1,
        ambient: 0.5,
        diffusivity: 0.5,
        texture: new Texture('assets/leaves.jpg'), // Tryna mess with leaves textures LOL, can remove
      }),

      title_screen: new Material(new defs.Textured_Phong(), {
          color: hex_color("#000000"),
          ambient: 1, 
          diffusivity: 0.1, 
          specularity: 0.1,
          texture: new Texture('assets/Title_Screen.png'),
      }),
      
      score_0: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_0.png'),
      }),
      score_1: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_1.png'),
      }),
      score_2: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_2.png'),
      }),
      score_3: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_3.png'),
      }),
      score_4: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_4.png'),
      }),
      score_5: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_5.png'),
      }),
      score_6: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_6.png'),
      }),
      score_7: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_7.png'),
      }),
      score_8: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_8.png'),
      }),
      score_9: new Material(new defs.Textured_Phong(), {
        color: hex_color('#000000'),
        specularity: 0.1,
        ambient: 1,
        diffusivity: 0.5,
        texture: new Texture('assets/score_9.png'),
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
      if (this.startgame == false) {
        this.startgame =
          !this.startgame &&
          this.game_music.play() &&
          this.background_sound.play();
      }
    });

    //Player Control
    this.key_triggered_button('Release/Reset Arrow', ['b'], () => {
      if (this.launched) this.velocity = 20;

      this.launched = !this.launched;
    }); // Fill in Draw Bow Function

    this.key_triggered_button('Draw Back', ['v'], () => {
      if (this.launched == false) {
        if (this.velocity < 50) this.velocity++;
        else if (this.velocity >= 50) this.velocity = 15;
      }
    });

    this.key_triggered_button('Moving Target', ['n'], () => {
      if (this.targetMoving != 0) this.targetMoving = 0;
      else this.targetMoving = 1;
    });

    this.key_triggered_button('Angle Up', ['g'], () => {
      if (this.theta < Math.PI / 2.5 && !this.launched)
        this.theta = this.theta + Math.PI / 16;
    });

    this.key_triggered_button('Angle Down', ['h'], () => {
      if (this.theta > 0 && !this.launched)
        this.theta = this.theta - Math.PI / 16;
    });

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
        this.targetPosition[2] = this.targetPosition[2] + 0.15;

        if (this.targetPosition[2] > 50) this.targetMoving = 2;
      }

      if (this.targetMoving == 2) {
        this.targetPosition[2] = this.targetPosition[2] - 0.15;

        if (this.targetPosition[2] < 15) this.targetMoving = 1;
      }
    } else {
      this.targetPosition[2] = 30;
    }

    target_transform = target_transform.times(
      Mat4.translation(
        this.targetPosition[0],
        this.targetPosition[1],
        this.targetPosition[2]
      )
    );

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

  draw_tree(context, program_state, x, y, z) {
    // draw trunk
    let tree_transform = Mat4.identity();
    tree_transform = tree_transform
      .times(Mat4.scale(1, -4.5, 1))
      .times(Mat4.translation(x, y, z));
    this.shapes.tree.draw(
      context,
      program_state,
      tree_transform,
      this.materials.wood
    );

    // draw the leaves
    var leaves_radius = 2;
    let leaves_transform = Mat4.identity();
    leaves_transform = leaves_transform
      .times(Mat4.scale(leaves_radius, leaves_radius, leaves_radius))
      .times(Mat4.translation(x / 2, y + 1.2, z / 2));

    let leaves1_transform = leaves_transform.times(Mat4.translation(0, 0.6, 0));
    let leaves2_transform = leaves_transform.times(Mat4.translation(-1, 0, 0));
    let leaves3_transform = leaves_transform.times(Mat4.translation(1, 0, 0));
    let leaves4_transform = leaves_transform.times(Mat4.translation(0, 0, -1));

    this.shapes.leaves.draw(
      context,
      program_state,
      leaves1_transform,
      this.materials.leaves
    );
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves2_transform,
      this.materials.leaves
    );
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves3_transform,
      this.materials.leaves
    );
    this.shapes.leaves.draw(
      context,
      program_state,
      leaves4_transform,
      this.materials.leaves
    );
  }

  setup_trees(context, program_state) {
    this.draw_tree(context, program_state, 14, 0.3, 20);
    this.draw_tree(context, program_state, -13, 0.3, 15);
    this.draw_tree(context, program_state, 15, 0.3, 10);
    this.draw_tree(context, program_state, -15, 0.3, 8);
    this.draw_tree(context, program_state, -25, 0.3, 22);
    this.draw_tree(context, program_state, -10, 0.3, 30);
    this.draw_tree(context, program_state, 10, 0.3, 30);
    this.draw_tree(context, program_state, 30, 0.3, 25);
  }

  pick_score(context, program_state, model_transform) {
    let score_transform = model_transform;
    score_transform = score_transform
      .times(Mat4.translation(2.25, -1, 2))
      .times(Mat4.scale(0.5, 0.5, 0.5))
      .times(Mat4.rotation(Math.PI, 0, 1, 0));

    switch (this.score) {
      case 0:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_0
        );

      case 1:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_1
        );

      case 2:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_2
        );

      case 3:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_3
        );

      case 4:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_4
        );

      case 5:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_5
        );

      case 6:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_6
        );

      case 7:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_7
        );

      case 8:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_8
        );

      case 9:
        this.shapes.score.draw(
          context,
          program_state,
          score_transform,
          this.materials.score_9
        );

      default:
        break;
    }

    if (this.score >= 10) {
      this.score = 0;
    }
  }

  arrow_land(x, y, z) {
    // arrow hits the grass
    return y <= -5;
  }

  arrow_collide(x, y, z) {
    // arrow hits the target
    let z_dist = z - (this.targetPosition[2] - 0.75);
    if (z_dist >= 0 && z_dist <= 2) {
      let x_dist = (x - this.targetPosition[0]) ** 2;
      let y_dist = (y - this.targetPosition[1]) ** 2;
      let distance = Math.sqrt(x_dist + y_dist);
      if (distance <= 4) {
        return true;
      }
    }
    return false;
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
    
    if (this.startgame) {
      let sun_transform = model_transform;
      var sun_radius = 5; //altered the sun radius because the more objects the more shadows, was looking a little dull
      sun_transform = sun_transform
        .times(Mat4.scale(sun_radius, sun_radius, sun_radius))
        .times(Mat4.translation(-10, 5, 8));

      const light_position = vec4(0, 10, 0, 1);
      program_state.lights = [
        new Light(light_position, color(1, 1, 1, 1), 10 ** sun_radius),
      ];

      // Draw Sun
      this.shapes.sun.draw(
        context,
        program_state,
        sun_transform,
        this.materials.sun
      );

      // Draw Grass Plane
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

      // Draw Sky background
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

      // Draw Target
      this.draw_target(context, program_state, model_transform);

      //Draw Score
      this.pick_score(context, program_state, model_transform);

      // Draw Player Head (can remove if you want)
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

      // Draw Trees in Background
      this.setup_trees(context, program_state);

      //Draw and animate arrow
      var shaft_transform = model_transform;
      //var tip_transform = model_transform;

      if (this.launched) {
        let x = this.arrow_init_x;
        let y = this.arrow_init_y;
        let z = this.arrow_init_z;

        let delta = t - this.launchtime;
        if (this.hit || this.miss) {
          delta = this.hittime - this.launchtime;
        }

        y =
          y +
          this.velocity * Math.sin(this.theta) * delta +
          0.5 * this.gravity * delta ** 2;

        if (this.hit) {
          z = this.targetPosition[2] - 0.75;
        } else {
          z = z + this.velocity * Math.cos(this.theta) * delta;
        }

        this.tangentAngle =
          Math.atan2(this.arrow_init_z - z, this.arrow_init_y - y) +
          Math.PI / 2;

        shaft_transform = shaft_transform
          .times(Mat4.translation(x, y, z))
          .times(Mat4.rotation(this.tangentAngle, 1, 0, 0))
          .times(
            Mat4.scale(
              this.arrow_scale_x,
              this.arrow_scale_y,
              this.arrow_scale_z
            )
          );

        if (this.arrow_collide(x, y, z) && !this.hit) {
          this.hittime = t;
          this.score++;
          this.hit = true;
        } else if (this.arrow_land(x, y, z) && !this.miss) {
          this.hittime = t;
          this.miss = true;
        }
      } else {
        this.hit = false;
        this.miss = false;
        shaft_transform = shaft_transform
          .times(
            Mat4.translation(
              this.arrow_init_x,
              this.arrow_init_y,
              this.arrow_init_z
            )
          )
          .times(Mat4.rotation(this.theta, -1, 0, 0))
          .times(
            Mat4.scale(
              this.arrow_scale_x,
              this.arrow_scale_y,
              this.arrow_scale_z
            )
          );

        this.launchtime = t;
      }

      this.shapes.shaft.draw(
        context,
        program_state,
        shaft_transform,
        this.materials.shaft
      );
      //this.shapes.arrow_tip.draw(context, program_state, shaft_transform, this.materials.tip);

      let meter_transform = model_transform;
      meter_transform = meter_transform
        .times(Mat4.translation(7.5 - this.velocity / 20, 4, 5))
        //.times(Mat4.rotation(90,0,0,0))
        .times(Mat4.scale(this.velocity / 20, 0.5, 0.5));

      this.shapes.meter.draw(
        context,
        program_state,
        meter_transform,
        this.materials.meter
      );

      program_state.projection_transform = Mat4.perspective(
        Math.PI / 2,
        context.width / context.height,
        0.1,
        500
      );
    }

    // title screen
    else {
      var sun_radius = 5;
      const light_position = vec4(0, 10, 0, 1);
      program_state.lights = [
        new Light(light_position, color(1, 1, 1, 1), 10 ** sun_radius),
      ];

      // Draw Sky background
      let background_transform = model_transform;
      background_transform = background_transform.times(
        Mat4.scale(100, 100, 100)
      );
      this.shapes.background.draw(
        context,
        program_state,
        background_transform,
        this.materials.sky_white
      );

      let title_transform = model_transform
        .times(Mat4.translation(0, 0, 1.6))
        .times(Mat4.scale(1.1, 1, 1));
      this.shapes.cube.draw(
        context,
        program_state,
        title_transform,
        this.materials.title_screen
      );

      program_state.projection_transform = Mat4.perspective(
        Math.PI / 2,
        context.width / context.height,
        0.1,
        500
      );
    }
  }
}

class Textured_Phong {
  fragment_glsl_code() {
    return (
      this.shared_glsl_code() +
      `
            varying vec2 f_tex_coord;
            uniform sampler2D texture;
            uniform float animation_time;
            
            void main(){
                // Sample the texture image in the correct place:
                vec4 tex_color = texture2D( texture, f_tex_coord);
                if( tex_color.w < .01 ) discard;
                                                                         // Compute an initial (ambient) color:
                gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                         // Compute the final color with contributions from lights:
                gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
        } `
    );
  }
}

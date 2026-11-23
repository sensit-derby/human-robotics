import type { ImageMetadata } from "astro";
import bipedalRobot from "../assets/facility/bipedal-robot.webp";
import robotManipulator from "../assets/facility/robot-manipulator.webp";
import robotHand from "../assets/facility/robot-hand.webp";
import realSense from "../assets/facility/realsense-d435.webp";
import emgSensor from "../assets/facility/emg-sensor.webp";
import printer from "../assets/facility/3d-printer.webp";
import workstation from "../assets/facility/gpu-workstation.webp";
import jetsonThor from "../assets/facility/jetson-thor.webp";
import jetsonOrinNano from "../assets/facility/jetson-orin-nano.webp";

interface Equipment {
  name: string;
  description: string;
  image: ImageMetadata;
  alt?: string;
  contacts: string[];
}

export const facilities: { category: string; equipment: Equipment[] }[] = [
  {
    category: "Robotic systems",
    equipment: [
      {
        name: "Bipedal robot system",
        description: "A two-legged research platform for studying locomotion, balance, and robot control.",
        image: bipedalRobot,
        alt: "Bipedal robot suspended in a laboratory test rig",
        contacts: ["quang-dan-le"],
      },
      {
        name: "Robot manipulator and hand",
        description: "A robotic arm and hand for grasping, object manipulation, and robot control experiments.",
        image: robotManipulator,
        alt: "Robotic arm with a gripper mounted on a workbench",
        contacts: ["oluwarotimi-samuel"],
      },
      {
        name: "Robot hand",
        description: "A robotic hand for exploring finger control, grasping, and dexterous manipulation.",
        image: robotHand,
        contacts: ["quang-dan-le"],
      },
    ],
  },
  {
    category: "Sensing systems",
    equipment: [
      {
        name: "Intel RealSense D435",
        description: "An RGB-D camera for capturing colour and depth data for robot perception and 3D scene reconstruction.",
        image: realSense,
        alt: "Intel RealSense D435 depth camera",
        contacts: ["oliver-ozioko"],
      },
      {
        name: "EMG sensing system",
        description: "An electromyography system for recording muscle activity in human–machine interaction and rehabilitation research.",
        image: emgSensor,
        contacts: ["oluwarotimi-samuel"],
      },
    ],
  },
  {
    category: "Prototyping and computing",
    equipment: [
      {
        name: "3D printer",
        description: "An additive manufacturing system for prototyping robot parts, mounts, and enclosures.",
        image: printer,
        contacts: ["quang-dan-le"],
      },
      {
        name: "RTX 5090 workstation",
        description: "A GPU workstation for training machine learning models, running simulations, and processing 3D data.",
        image: workstation,
        alt: "NVIDIA GeForce RTX 5090 graphics card and packaging",
        contacts: ["quang-dan-le"],
      },
      {
        name: "NVIDIA Jetson Thor",
        description: "An edge computing platform for running AI workloads on robotic systems.",
        image: jetsonThor,
        contacts: ["quang-dan-le"],
      },
      {
        name: "NVIDIA Jetson Orin Nano",
        description: "Two compact edge computers for prototyping embedded vision and robotics applications.",
        image: jetsonOrinNano,
        contacts: ["quang-dan-le", "oluwarotimi-samuel"],
      },
    ],
  },
];

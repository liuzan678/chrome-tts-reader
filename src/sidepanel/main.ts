import "./styles.css";
import { mountApp } from "./app";

const root = document.getElementById("app");

if (!root) {
  throw new Error("Missing #app root node.");
}

mountApp(root);

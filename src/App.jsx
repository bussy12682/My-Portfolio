import React, { useEffect } from "react";
import prototypeHTML from "../prototype.html?raw";
import logoURL from "../../WhatsApp Image 2026-10-16 at 07.07.35.jpeg";
import DashboardExperience from "./Dashboard.jsx";

const sourceDocument = new DOMParser().parseFromString(prototypeHTML, "text/html");
const styles = [...sourceDocument.querySelectorAll("style")]
  .map((style) => style.textContent)
  .join("\n");
const scripts = [...sourceDocument.querySelectorAll("script")]
  .map((script) => script.textContent)
  .filter(Boolean);

if (scripts.length !== 1) {
  throw new Error(`Expected one inline prototype script, found ${scripts.length}.`);
}

const attributeNames = {
  class: "className",
  for: "htmlFor",
  tabindex: "tabIndex",
  autocomplete: "autoComplete",
  contenteditable: "contentEditable",
  crossorigin: "crossOrigin",
  datetime: "dateTime",
  formaction: "formAction",
  formenctype: "formEncType",
  formmethod: "formMethod",
  formnovalidate: "formNoValidate",
  formtarget: "formTarget",
  frameborder: "frameBorder",
  maxlength: "maxLength",
  minlength: "minLength",
  readonly: "readOnly",
  rowspan: "rowSpan",
  colspan: "colSpan",
  srcset: "srcSet",
  usemap: "useMap",
  viewbox: "viewBox",
  pathlength: "pathLength",
  preserveaspectratio: "preserveAspectRatio",
  "fill-rule": "fillRule",
  "stroke-width": "strokeWidth",
  "stroke-linecap": "strokeLinecap",
  "stroke-linejoin": "strokeLinejoin",
  "stroke-dasharray": "strokeDasharray",
  "stroke-dashoffset": "strokeDashoffset",
  "stop-color": "stopColor",
  "stop-opacity": "stopOpacity",
  "xlink:href": "xlinkHref",
};

const booleanAttributes = new Set([
  "allowfullscreen",
  "async",
  "autofocus",
  "autoplay",
  "checked",
  "controls",
  "default",
  "defer",
  "disabled",
  "formnovalidate",
  "hidden",
  "ismap",
  "itemscope",
  "loop",
  "multiple",
  "muted",
  "nomodule",
  "novalidate",
  "open",
  "readonly",
  "required",
  "reversed",
  "selected",
]);

function parseStyle(value) {
  return Object.fromEntries(
    value
      .split(";")
      .map((declaration) => declaration.trim())
      .filter(Boolean)
      .map((declaration) => {
        const separator = declaration.indexOf(":");
        const name = declaration.slice(0, separator).trim();
        const property = name.startsWith("--")
          ? name
          : name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        return [property, declaration.slice(separator + 1).trim()];
      }),
  );
}

function toReactNode(node, key) {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent;
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  const element = node;
  if (element.tagName === "SCRIPT") return null;

  const props = { key };
  for (const attribute of element.attributes) {
    const name = attribute.name.toLowerCase();
    if (name === "value" && ["INPUT", "TEXTAREA"].includes(element.tagName)) {
      props.defaultValue = attribute.value;
    } else if (name === "checked") {
      props.defaultChecked = true;
    } else if (name === "selected") {
      continue;
    } else if (name === "style") {
      props.style = parseStyle(attribute.value);
    } else if (name === "src" && attribute.value.startsWith("../WhatsApp%20Image")) {
      props.src = logoURL;
    } else if (booleanAttributes.has(name)) {
      props[attributeNames[name] || name] = true;
    } else {
      props[attributeNames[name] || name] = attribute.value;
    }
  }

  const children = [...element.childNodes].map((child, index) =>
    toReactNode(child, `${key}.${index}`),
  );
  if (element.id === "dashboard-page") {
    const { key: sectionKey, ...sectionProps } = props;
    return React.createElement(DashboardExperience, {
      key: sectionKey,
      sectionProps,
      legacyChildren: children,
    });
  }
  if (element.tagName === "TEXTAREA" && !Object.hasOwn(props, "defaultValue")) {
    props.defaultValue = element.textContent;
    return React.createElement(element.tagName.toLowerCase(), props);
  }
  if (element.tagName === "SELECT") {
    const selectedOption = element.querySelector("option[selected]");
    if (selectedOption) props.defaultValue = selectedOption.value;
  }

  return React.createElement(element.tagName.toLowerCase(), props, ...children);
}

const prototypeContent = [...sourceDocument.body.childNodes].map((node, index) =>
  toReactNode(node, `prototype.${index}`),
);

export default function App() {
  useEffect(() => {
    const script = document.createElement("script");
    script.textContent = `(() => {\n${scripts[0]}\n})();`;
    document.body.appendChild(script);

    return () => script.remove();
  }, []);

  return (
    <>
      <style>{styles}</style>
      {prototypeContent}
    </>
  );
}

function styleVariables(style = {}) {
  return {
    ...(style.backgroundColor ? { "--stash-composables-entity-card-background": style.backgroundColor } : {}),
    ...(style.borderColor ? { "--stash-composables-entity-card-border": style.borderColor } : {}),
    ...(style.textColor ? { "--stash-composables-entity-card-text": style.textColor } : {}),
  };
}

export function renderEntityCard(runtime, props = {}) {
  const { React } = runtime;
  if (!React) {
    throw new Error("Entity card requires a React runtime");
  }

  const attributes = Array.isArray(props.attributes) ? props.attributes.filter(Boolean) : [];
  const thumbnail = props.thumbnail;
  const rootProps = {
    className: ["stash-composables-entity-card", props.className].filter(Boolean).join(" "),
    ...(Object.keys(styleVariables(props.style)).length ? { style: styleVariables(props.style) } : {}),
  };

  const header = props.header
    ? React.createElement("div", { className: "stash-composables-entity-card__header" }, props.header)
    : null;
  const media = thumbnail?.src
    ? React.createElement(
        "div",
        { className: "stash-composables-entity-card__media" },
        React.createElement("img", {
          alt: thumbnail.alt ?? "",
          className: "stash-composables-entity-card__thumbnail",
          loading: "lazy",
          src: thumbnail.src,
        }),
        thumbnail.overlay
      )
    : null;
  const body = React.createElement(
    "div",
    { className: "stash-composables-entity-card__body" },
    props.title
      ? React.createElement("div", { className: "stash-composables-entity-card__title" }, props.title)
      : null,
    props.description
      ? React.createElement("div", { className: "stash-composables-entity-card__description" }, props.description)
      : null,
    attributes.length
      ? React.createElement(
          "dl",
          { className: "stash-composables-entity-card__attributes" },
          ...attributes.map((attribute, index) => React.createElement(
            "div",
            { className: "stash-composables-entity-card__attribute", key: attribute.key ?? index },
            attribute.label
              ? React.createElement("dt", null, attribute.label)
              : null,
            React.createElement("dd", null, attribute.content)
          ))
        )
      : null
  );
  const footer = props.footer || props.actions
    ? React.createElement(
        "div",
        { className: "stash-composables-entity-card__footer" },
        props.footer
          ? React.createElement("div", { className: "stash-composables-entity-card__footer-content" }, props.footer)
          : null,
        props.actions
          ? React.createElement("div", { className: "stash-composables-entity-card__actions" }, props.actions)
          : null
      )
    : null;

  return React.createElement("article", rootProps, ...[header, media, body, footer].filter(Boolean));
}

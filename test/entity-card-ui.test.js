import test from "node:test";
import assert from "node:assert/strict";

import { renderEntityCard } from "../src/index.js";

function createFakeReact() {
  return {
    createElement(type, props, ...children) {
      return { type, props: props ?? {}, children };
    },
  };
}

test("renderEntityCard renders caller-provided presentation data and slots", () => {
  const React = createFakeReact();
  const overlay = React.createElement("img", { alt: "Motion heatmap", src: "/heatmap.png" });
  const performer = React.createElement("a", { href: "/performers/1" }, "Performer");

  const card = renderEntityCard(
    { React },
    {
      actions: React.createElement("button", null, "Queue"),
      attributes: [
        { content: performer, label: "Performers" },
        { content: "2 video · 1 image", label: "Media" },
      ],
      description: "Caller-owned description",
      footer: React.createElement("span", null, "Footer"),
      header: React.createElement("span", null, "Unwatched"),
      style: {
        backgroundColor: "#151515",
        borderColor: "#b67700",
        textColor: "#f4f1e8",
      },
      thumbnail: { alt: "Scene thumbnail", overlay, src: "/scene/1/screenshot" },
      title: React.createElement("a", { href: "/scenes/1" }, "Scene title"),
    }
  );

  assert.equal(card.type, "article");
  assert.equal(card.props.className, "stash-composables-entity-card");
  assert.deepEqual(card.props.style, {
    "--stash-composables-entity-card-background": "#151515",
    "--stash-composables-entity-card-border": "#b67700",
    "--stash-composables-entity-card-text": "#f4f1e8",
  });

  const [header, media, body, footer] = card.children;
  assert.equal(header.props.className, "stash-composables-entity-card__header");
  assert.equal(media.children[0].props.src, "/scene/1/screenshot");
  assert.equal(media.children[1], overlay);
  assert.equal(body.children[0].children[0].children[0], "Scene title");
  assert.equal(body.children[1].children[0], "Caller-owned description");
  assert.equal(body.children[2].children[0].children[0].children[0], "Performers");
  assert.equal(body.children[2].children[0].children[1].children[0], performer);
  assert.equal(footer.children[0].children[0].children[0], "Footer");
  assert.equal(footer.children[1].children[0].children[0], "Queue");
});

test("renderEntityCard omits empty sections", () => {
  const React = createFakeReact();
  const card = renderEntityCard({ React }, { title: "Untitled" });

  assert.equal(card.type, "article");
  assert.equal(card.children.length, 1);
  assert.equal(card.children[0].props.className, "stash-composables-entity-card__body");
});

test("renderEntityCard positions a caller-provided badge rail", () => {
  const React = createFakeReact();
  const rail = React.createElement(
    "div",
    { className: "caller-badge-rail" },
    React.createElement("span", null, "4.5"),
    React.createElement("span", null, "New")
  );

  const card = renderEntityCard({ React }, { badgeRail: rail, title: "Scene" });

  assert.equal(card.children[0].props.className, "stash-composables-entity-card__badge-rail");
  assert.equal(card.children[0].children[0], rail);
});

test("renderEntityCard renders hoverable count entries with caller-provided popover content", () => {
  const React = createFakeReact();
  const icon = React.createElement("span", { "aria-hidden": true }, "P");
  const popover = React.createElement("a", { href: "/performers/1" }, "Performer");

  const card = renderEntityCard(
    { React },
    {
      countRail: [{ content: popover, count: "3", icon, key: "performers", label: "3 performers" }],
      title: "Scene",
    }
  );

  assert.equal(card.children.length, 2);
  assert.equal(card.children[0].props.className, "stash-composables-entity-card__body");
  assert.equal(card.children[1].props.className, "stash-composables-entity-card__count-rail");
  const entry = card.children[1].children[0];
  assert.equal(entry.props.className, "stash-composables-entity-card__count-entry");
  assert.equal(entry.children[0].type, "button");
  assert.equal(entry.children[0].props.title, "3 performers");
  assert.equal(entry.children[0].children[0], icon);
  assert.equal(entry.children[0].children[1], "3");
  assert.equal(entry.children[1].props.className, "stash-composables-entity-card__count-popover");
  assert.equal(entry.children[1].children[0], popover);
});

test("renderEntityCard can hide zero-count entries when requested", () => {
  const React = createFakeReact();
  const card = renderEntityCard(
    { React },
    {
      countRail: [
        { content: "No tags", count: 0, key: "tags", label: "0 tags" },
        { content: "Performer", count: 1, key: "performers", label: "1 performer" },
      ],
      showZeroCounts: false,
      title: "Scene",
    }
  );

  const countRail = card.children[1];
  assert.equal(countRail.props.className, "stash-composables-entity-card__count-rail");
  assert.equal(countRail.children.length, 1);
  assert.equal(countRail.children[0].props.key, "performers");
});

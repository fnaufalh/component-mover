const root = figma.root;
const components: any = [];
const regex = "components";
let currentPage = figma.currentPage;
let select = figma.currentPage.selection;
let newPage: any = null;
let orderCount = 0;

function moveIt(components: any, componentPage: any) {
  if (components.length === 0) {
    figma.closePlugin("There is no component, so clean!");
    return;
  }
  components.sort((a: any, b: any) => a.name.localeCompare(b.name));
  select = components;
  for (const item of select) {
    componentPage.appendChild(item);
  }
  figma.currentPage = newPage;
  for (const [index, value] of components.entries()) {
    orderCount += index + value.width + (index > 0 ? 200 : 0);
    const order = { x: orderCount, y: 0 };
    value.x = order.x;
    value.y = order.y;
  }
  figma.viewport.scrollAndZoomIntoView(components);
}

function componentMover() {
  const findComponents = Array.from(
    currentPage.findAll(
      (node) =>
        node.type === "COMPONENT_SET" ||
        (node.type === "COMPONENT" && node.parent?.type !== "COMPONENT_SET")
    )
  );
  for (const component of findComponents) {
    if (component.parent?.type === "FRAME") {
      let frame = component.parent as FrameNode;
      let componentNode = component as ComponentNode;
      let newInstance = componentNode.createInstance();
      newInstance.x = component.x;
      newInstance.y = component.y;
      frame.insertChild(frame.children.indexOf(component), newInstance);
    }
    components.push(component);
  }

  let findPage = root.findChild(
    (node) => node.type === "PAGE" && node.name.toLowerCase().includes(regex)
  ) as PageNode;
  if (findPage == null) {
    newPage = figma.createPage();
    newPage.name = "Components";
  } else {
    newPage = findPage;
  }
  moveIt(components, newPage);
  figma.closePlugin("Moving success! Thank you for using me.");
}

componentMover();

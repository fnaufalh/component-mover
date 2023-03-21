const root = figma.root;
const components: any = [];
const regex = "components";
let currentPage = figma.currentPage;
let select = figma.currentPage.selection;
let newPage: any = null;

function findComponents(currentPage: PageNode) {
  return Array.from(
    currentPage.findAll(
      (node) =>
        node.type === "COMPONENT_SET" ||
        (node.type === "COMPONENT" && node.parent?.type !== "COMPONENT_SET")
    )
  );
}

function compareSort(componentPage: any) {
  let orderCount = 0;
  components.sort((a: any, b: any) => a.name.localeCompare(b.name));
  for (const item of components) {
    componentPage.appendChild(item);
  }
  figma.currentPage = newPage;
  for (const [index, value] of components.entries()) {
    if (index > 0) {
      orderCount += components[index - 1].width + 200;
    } else {
      orderCount = 0;
    }
    const order = { x: orderCount, y: 0 };
    value.x = order.x;
    value.y = order.y;
  }
}

function isThereComponents(page: PageNode) {
  const componentResult = findComponents(page);
  for (const node of componentResult) {
    components.push(node);
  }
}

function moveIt(componentPage: any) {
  if (components.length === 0) {
    figma.closePlugin("There is no component, so clean!");
    return;
  }
  compareSort(componentPage);
  figma.viewport.scrollAndZoomIntoView(components);
}

function componentMover() {
  const componentResult = findComponents(currentPage);
  for (const component of componentResult) {
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
    if (currentPage !== newPage) {
      isThereComponents(newPage);
    }
  }
  moveIt(newPage);
  figma.closePlugin("Moving success! Thank you for using me.");
}

componentMover();

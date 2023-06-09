const root = figma.root;
const components: any = [];
let currentPage = figma.currentPage;
let select = figma.currentPage.selection;
let newPage: any = null;
let spacing = 200;
let pageName = "Components";
let pageNameLC = "components";

function whosTallest() {
  let tallest = null;
  for (const node of components) {
    if (!tallest || tallest.height < node.height) {
      tallest = node;
    }
  }

  return tallest;
}

function findComponents(currentPage: PageNode) {
  return Array.from(
    currentPage.findAll(
      (node) =>
        node.type === "COMPONENT_SET" ||
        (node.type === "COMPONENT" && node.parent?.type !== "COMPONENT_SET")
    )
  );
}

function findOthers(currentPage: PageNode) {
  return Array.from(
    currentPage.findChildren(
      (node) => node.type !== "COMPONENT_SET" && node.type !== "COMPONENT"
    )
  );
}

function compareSort(componentPage: any) {
  let cumulativeX = 0;
  let cumulativeY = null;
  //find other objects to get the smallest y axis
  let others = findOthers(newPage);
  if (others[0]) {
    let tallest = whosTallest();
    cumulativeY = others[0].y - 200 - tallest.height;
  }
  components.sort((a: any, b: any) => a.name.localeCompare(b.name));
  for (const item of components) {
    componentPage.appendChild(item);
  }
  figma.currentPage = newPage;

  for (const [index, value] of components.entries()) {
    if (index > 0) {
      cumulativeX += components[index - 1].width + spacing;
    } else {
      cumulativeX = 0;
    }
    const order = { x: cumulativeX, y: cumulativeY ? cumulativeY : 0 };
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
    (node) =>
      node.type === "PAGE" && node.name.toLowerCase().includes(pageNameLC)
  ) as PageNode;
  if (findPage == null) {
    newPage = figma.createPage();
    newPage.name = pageName;
  } else {
    newPage = findPage;
    /*
      if currentPage is same with newPage 
      then plugin no need to check the page
      just tidying up it
    */
    if (currentPage !== newPage) {
      isThereComponents(newPage);
    }
  }
  moveIt(newPage);
  figma.closePlugin("Moving success! Thank you for using me.");
}

figma.showUI(__html__);
figma.ui.resize(320, 448);
figma.ui.onmessage = (message) => {
  if (message) {
    spacing = parseInt(message.spacing);
    if (message.action === "move") {
      pageName = message.page;
      pageNameLC = message.page.toLowerCase();
    } else {
      pageName = currentPage.name;
      pageNameLC = currentPage.name.toLocaleLowerCase();
    }
    componentMover();
  }
};

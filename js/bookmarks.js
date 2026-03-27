import { elements } from "./shared.js";

function createBookmarkLink(bookmark) {
  const anchor = document.createElement("a");
  anchor.className = "bookmark-link";
  anchor.href = bookmark.url;
  anchor.target = "_self";

  const favicon = document.createElement("img");
  favicon.className = "bookmark-favicon";
  favicon.alt = "";
  favicon.loading = "lazy";
  favicon.src = `chrome://favicon2/?size=32&pageUrl=${encodeURIComponent(bookmark.url)}`;
  favicon.addEventListener("error", () => {
    if (!favicon.dataset.fallbackApplied) {
      favicon.dataset.fallbackApplied = "true";
      favicon.src = `https://www.google.com/s2/favicons?sz=32&domain_url=${encodeURIComponent(bookmark.url)}`;
      return;
    }

    favicon.classList.add("bookmark-favicon-hidden");
  });

  const label = document.createElement("span");
  label.className = "bookmark-label";
  label.textContent = bookmark.title || bookmark.url;

  anchor.appendChild(favicon);
  anchor.appendChild(label);
  return anchor;
}

function extractBookmarkData(nodes, result) {
  for (const node of nodes) {
    if (node.url) {
      result.rootLinks.push({ title: node.title, url: node.url });
      continue;
    }

    if (!Array.isArray(node.children) || node.children.length === 0) {
      continue;
    }

    const folderLinks = node.children.filter((child) => Boolean(child.url)).map((child) => ({
      title: child.title,
      url: child.url
    }));

    if (folderLinks.length > 0) {
      result.folders.push({
        title: node.title || "Untitled folder",
        links: folderLinks,
        id: node.id
      });
    }

    const childFolders = node.children.filter((child) => Array.isArray(child.children) && child.children.length > 0);
    extractBookmarkData(childFolders, result);
  }
}

function createFolderCard(folder) {
  const dropdown = document.createElement("details");
  dropdown.className = "bookmark-folder-dropdown";
  dropdown.open = true;

  const summary = document.createElement("summary");
  summary.className = "bookmark-folder-summary";
  summary.textContent = `${folder.title} (${folder.links.length})`;

  const linksWrap = document.createElement("div");
  linksWrap.className = "bookmark-folder-links";

  for (const link of folder.links) {
    linksWrap.appendChild(createBookmarkLink(link));
  }

  dropdown.appendChild(summary);
  dropdown.appendChild(linksWrap);
  return dropdown;
}

function clearBookmarksUI() {
  elements.bookmarksRootLinks.textContent = "";
  elements.bookmarksFolders.textContent = "";
  elements.bookmarksMessage.textContent = "";
}

export async function loadAndRenderBookmarks() {
  clearBookmarksUI();
  elements.bookmarksMessage.textContent = "Loading bookmarks...";

  try {
    const tree = await chrome.bookmarks.getTree();
    const data = { rootLinks: [], folders: [] };
    extractBookmarkData(tree, data);

    for (const link of data.rootLinks) {
      elements.bookmarksRootLinks.appendChild(createBookmarkLink(link));
    }

    for (const folder of data.folders) {
      elements.bookmarksFolders.appendChild(createFolderCard(folder));
    }

    if (data.rootLinks.length === 0 && data.folders.length === 0) {
      elements.bookmarksMessage.textContent = "No bookmarks found.";
      return;
    }

    elements.bookmarksMessage.textContent = "";
  } catch (error) {
    elements.bookmarksMessage.textContent = "Unable to load bookmarks right now.";
  }
}

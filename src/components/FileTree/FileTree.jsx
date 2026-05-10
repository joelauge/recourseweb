import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FolderIcon, TYPE_ICONS, ChevronIcon, MoreVerticalIcon } from '../Icons';
import TagCloud from '../TagCloud/TagCloud';

const buildFileTree = (files) => {
  const tree = { name: 'root', isRoot: true, children: [], files: [] };
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (isLast) {
        current.files.push(file);
      } else {
        let folder = current.children.find(c => c.name === part);
        if (!folder) {
          folder = { name: part, children: [], files: [], isFolder: true };
          current.children.push(folder);
        }
        current = folder;
      }
    });
  });
  
  return tree;
};

const TreeNode = ({ node, level = 0, ...props }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (node.isRoot) {
    return (
      <div className="file-tree">
        {node.children.map(child => (
          <TreeNode key={child.name} node={child} level={level} {...props} />
        ))}
        {node.files.map(file => (
          <FileNode key={file.id} file={file} level={level} {...props} />
        ))}
      </div>
    );
  }

  return (
    <div className="tree-node-wrap">
      <div className="tree-folder" onClick={() => setIsOpen(!isOpen)}>
        <ChevronIcon className={`tree-chevron ${isOpen ? 'open' : ''}`} size={10} />
        <FolderIcon size={14} />
        <span>{node.name}</span>
      </div>
      {isOpen && (
        <div className="tree-children">
          {node.children.map(child => (
            <TreeNode key={child.name} node={child} level={level + 1} {...props} />
          ))}
          {node.files.map(file => (
            <FileNode key={file.id} file={file} level={level + 1} {...props} />
          ))}
        </div>
      )}
    </div>
  );
};

const FileNode = ({ file, onFileClick, onFileDoubleClick, onDragStart, onDragEnd, onDelete, onRename, onMove, availableSessions, onUpdateFile, onClickTag }) => {
  const Icon = TYPE_ICONS[file.type] || TYPE_ICONS.raw;
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const [activeSubMenu, setActiveSubMenu] = useState(null);

  useEffect(() => {
    if (!showMenu) return;
    const handleClose = () => setShowMenu(false);
    window.addEventListener('click', handleClose);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [showMenu]);

  const handleMenuClick = (e) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPos({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setShowMenu(true);
    setActiveSubMenu(null);
  };
  
  return (
    <div 
      className={`tree-file ${file.dragging ? 'dragging' : ''}`}
      onClick={() => onFileClick(file)}
      onDoubleClick={() => onFileDoubleClick && onFileDoubleClick(file)}
      draggable
      onDragStart={(e) => onDragStart(e, file)}
      onDragEnd={onDragEnd}
    >
      <div className="tree-file-icon">
        <Icon />
      </div>
      <span className="tree-file-name">{file.name}</span>
      {file.isNew && <span className="new-badge-micro">NEW</span>}
      <div style={{ flex: 1 }} />
      <span className="tree-file-size">{file.mb} MB</span>
      <button className="tree-menu-btn" onClick={handleMenuClick}>
        <MoreVerticalIcon />
      </button>

      {showMenu && createPortal(
        <div className="file-menu-dropdown tree-menu" style={{ top: menuPos.top, right: menuPos.right }} onClick={(e) => e.stopPropagation()} onMouseLeave={() => setActiveSubMenu(null)}>
          <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu(null)} onClick={() => { setShowMenu(false); onRename && onRename(file.id); }}>Rename</div>
          <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu('move')}>
            Move to... <span className="menu-caret">▶</span>
            {activeSubMenu === 'move' && (
              <div className="file-submenu-dropdown">
                <div className="file-submenu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove && onMove(file.id, 'new'); }}>New Session...</div>
                <div className="submenu-divider" />
                {availableSessions && availableSessions.length > 0 ? (
                  availableSessions.map(ses => (
                    <div key={ses.id} className="file-submenu-item" onClick={(e) => { e.stopPropagation(); setShowMenu(false); onMove && onMove(file.id, ses.id); }}>{ses.label}</div>
                  ))
                ) : (
                  <div className="file-submenu-item" style={{opacity: 0.5}}>No other sessions</div>
                )}
              </div>
            )}
          </div>
          <div className="file-menu-item" onMouseEnter={() => setActiveSubMenu('tag')}>
            Tag... <span className="menu-caret">▶</span>
            {activeSubMenu === 'tag' && (
              <div className="file-submenu-dropdown tag-submenu-v2">
                <TagCloud 
                  file={file} 
                  onUpdateFile={onUpdateFile} 
                  onClickTag={onClickTag} 
                />
              </div>
            )}
          </div>
          <div className="submenu-divider" />
          <div className="file-menu-item" style={{ color: "var(--red)" }} onMouseEnter={() => setActiveSubMenu(null)} onClick={() => { setShowMenu(false); onDelete && onDelete(file.id); }}>Delete</div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default function FileTree({ files, onFileClick, onFileDoubleClick, onDragStart, onDragEnd, onDelete, onRename, onMove, availableSessions, onUpdateFile, onClickTag }) {
  const tree = useMemo(() => buildFileTree(files), [files]);
  
  return (
    <div className="file-tree-container">
      <TreeNode 
        node={tree} 
        onFileClick={onFileClick} 
        onFileDoubleClick={onFileDoubleClick}
        onDragStart={onDragStart} 
        onDragEnd={onDragEnd}
        onDelete={onDelete}
        onRename={onRename}
        onMove={onMove}
        availableSessions={availableSessions}
        onUpdateFile={onUpdateFile}
        onClickTag={onClickTag}
      />
    </div>
  );
}

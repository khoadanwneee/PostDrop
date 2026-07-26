import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('sticker zoom and resize controls', () => {
  const canvasComponent = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'letter-canvas.tsx',
    ),
    'utf8',
  );
  const elementComponent = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'element-renderer.tsx',
    ),
    'utf8',
  );
  const editorComponent = readFileSync(
    join(
      __dirname,
      '..',
      '..',
      'app',
      'components',
      'letter-editor',
      'letter-editor.tsx',
    ),
    'utf8',
  );
  const stylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'styles.css'),
    'utf8',
  );
  const editorStylesheet = readFileSync(
    join(__dirname, '..', '..', 'public', 'letter-editor.css'),
    'utf8',
  );

  it('renders proportional resize handles on every corner', () => {
    expect(canvasComponent).toContain('<Transformer');
    expect(canvasComponent).toContain('keepRatio');
    expect(canvasComponent).toContain("'top-left'");
    expect(canvasComponent).toContain("'bottom-right'");
  });

  it('supports mouse, pen, touch, drag, and transform interactions', () => {
    expect(elementComponent).toContain('onDragEnd');
    expect(canvasComponent).toContain('onTouchStart');
    expect(canvasComponent).toContain('onTransformEnd');
    expect(canvasComponent).toContain('setPointerCapture');
    expect(canvasComponent).toContain('onPointerMove={moveContentSticker}');
    expect(stylesheet).toContain('touch-action: none;');
  });

  it('keeps transformer controls usable while dimensions and zoom change', () => {
    expect(canvasComponent).toContain('22 / interactionScale');
    expect(canvasComponent).toContain('anchorSize={transformerAnchorSize}');
    expect(canvasComponent).toContain('node.scaleX(1)');
    expect(canvasComponent).toContain('node.scaleY(1)');
  });

  it('keeps resize inside the canvas while allowing user stickers in the writing area', () => {
    expect(canvasComponent).toContain('newBox.width < 24');
    expect(canvasComponent).toContain("selectedElement.type === 'image'");
    expect(canvasComponent).toContain("selectedElement.source === 'user'");
    expect(canvasComponent).toContain(
      'isOverlappingSafeArea(candidate, theme.safeArea, canvasSize)',
    );
    expect(canvasComponent).toContain(
      'newBox.x + newBox.width > canvasSize.width',
    );
  });
  it('renders the paper without editor framing regions', () => {
    const stageStyles = editorStylesheet.match(
      /\.letter-editor-stage \{([\s\S]*?)\}/,
    )?.[1];
    const viewportStyles = editorStylesheet.match(
      /\.letter-canvas-viewport \{([\s\S]*?)\}/,
    )?.[1];

    expect(editorComponent).not.toContain('letter-editor-stage-head');
    expect(canvasComponent).not.toContain('dash={[5, 6]}');
    expect(stageStyles).toContain('border: 0;');
    expect(stageStyles).toContain('background: transparent;');
    expect(stageStyles).toContain('box-shadow: none;');
    expect(viewportStyles).toContain('margin: 0;');
    expect(viewportStyles).toContain('padding: 0;');
    expect(viewportStyles).toContain('background: transparent;');
  });
});

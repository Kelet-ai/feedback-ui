import type { Meta, StoryObj } from '@storybook/react-vite';
import { Markdown } from '@storybook/addon-docs/blocks';

// Import README as raw text
// @ts-expect-error ts(2307)
import readmeContent from '../README.md?raw';

const meta: Meta = {
  title: 'Documentation/README',
  parameters: {
    docs: {
      page: () => (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <Markdown>{readmeContent}</Markdown>
        </div>
      ),
    },
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ProjectReadme: Story = {
  render: () => <></>,
};

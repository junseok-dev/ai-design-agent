import type { DesignSection, SectionType } from '../../types/design'

export const ADDABLE_SECTION_TYPES = [
  'hero',
  'text-block',
  'skill-list',
  'timeline',
  'card-grid',
  'divider',
  'contact-info',
] as const

export type AddableSectionType = typeof ADDABLE_SECTION_TYPES[number]

export const SECTION_TYPE_LABELS: Record<AddableSectionType, string> = {
  'hero': 'Hero',
  'text-block': 'Text block',
  'skill-list': 'Skill list',
  'timeline': 'Timeline',
  'card-grid': 'Card grid',
  'divider': 'Divider',
  'contact-info': 'Contact info',
}

export function isAddableSectionType(type: SectionType): type is AddableSectionType {
  return ADDABLE_SECTION_TYPES.includes(type as AddableSectionType)
}

export function createDefaultSection(type: AddableSectionType): DesignSection {
  const id = crypto.randomUUID()

  switch (type) {
    case 'hero':
      return {
        id,
        type,
        props: {
          title: 'New title',
          subtitle: 'Subtitle',
          description: 'Add a short introduction.',
          tags: [],
        },
      }
    case 'text-block':
      return {
        id,
        type,
        props: {
          heading: 'Section title',
          body: 'Add your content here.',
        },
      }
    case 'skill-list':
      return {
        id,
        type,
        props: {
          heading: 'Skills',
          skills: [{ name: 'New skill', level: 80 }],
          displayStyle: 'tags',
        },
      }
    case 'timeline':
      return {
        id,
        type,
        props: {
          heading: 'Experience',
          items: [{ period: '', title: 'New item', organization: '' }],
        },
      }
    case 'card-grid':
      return {
        id,
        type,
        props: {
          heading: 'Projects',
          columns: 2,
          cards: [{ title: 'New card', description: '' }],
        },
      }
    case 'divider':
      return {
        id,
        type,
        props: {
          style: 'line',
          margin: 8,
        },
      }
    case 'contact-info':
      return {
        id,
        type,
        props: {
          heading: 'Contact',
          layout: 'horizontal',
          items: [{ type: 'email', value: '' }],
        },
      }
  }
}

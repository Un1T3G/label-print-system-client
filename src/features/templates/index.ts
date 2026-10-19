export { AdminTemplatesPage } from './components/AdminTemplatesPage';
export { NewTemplatePage } from './components/NewTemplatePage';
export { EditTemplatePage } from './components/EditTemplatePage';
export { TemplateEditorForm } from './components/TemplateEditorForm';
export { LabelLivePreview } from './components/LabelLivePreview';

export {
  useTemplates,
  useTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  useDeleteTemplate,
} from './hooks/use-templates';

export { DEFAULT_TEMPLATES } from './lib/default-templates';
export {
  getTemplateElements,
  getDefaultElements,
  syncConfigWithElements,
  ELEMENT_PRESET_CATALOG,
  LAYOUT_PRESETS,
} from './lib/label-elements';

export {
  createTemplateSchema,
  updateTemplateSchema,
  type CreateTemplateSchemaInput,
  type UpdateTemplateSchemaInput,
} from './model/template-schema';

export {
  getElementDefinition,
  getAllElementDefinitions,
  registerElementDefinition,
} from './model/element-registry';
export type {
  ElementDefinition,
  ElementRenderProps,
  ElementInspectorProps,
  ElementCapabilities,
} from './model/element-registry-types';

export type * from './types';

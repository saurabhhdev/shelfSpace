import React from 'react';
import { CreateCollectionModal, type CreateCollectionModalProps } from './CreateCollectionModal';

export const CollectionTemplateModal: React.FC<CreateCollectionModalProps> = (props) => {
  return <CreateCollectionModal {...props} />;
};

export default CollectionTemplateModal;

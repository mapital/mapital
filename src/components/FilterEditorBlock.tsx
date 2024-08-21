import React, { PropsWithChildren } from 'react'
import InputButton from './InputButton'
import {MdDelete} from 'react-icons/md'
import { WithTranslation, withTranslation } from 'react-i18next';

type FilterEditorBlockInternalProps = PropsWithChildren & {
  onDelete(...args: unknown[]): unknown
} & WithTranslation;

class FilterEditorBlockInternal extends React.Component<FilterEditorBlockInternalProps> {
  render() {
    const t = this.props.t;
    return <div className="maputnik-filter-editor-block">
      <div className="maputnik-filter-editor-block-action">
        <InputButton
          className="maputnik-delete-filter"
          onClick={this.props.onDelete}
          title={t("Delete filter block")}
        >
          <MdDelete />
        </InputButton>
      </div>
      <div className="maputnik-filter-editor-block-content">
        {this.props.children}
      </div>
    </div>
  }
}

const FilterEditorBlock = withTranslation()(FilterEditorBlockInternal);
export default FilterEditorBlock;

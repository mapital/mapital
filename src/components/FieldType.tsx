import React from 'react'

import latest from '@maplibre/maplibre-gl-style-spec/dist/latest.json'
import Block from './Block'
import InputSelect from './InputSelect'
import InputString from './InputString'
import { WithTranslation, withTranslation } from 'react-i18next';

type FieldTypeInternalProps = {
  value: string
  wdKey?: string
  onChange(value: string): unknown
  error?: {message: string}
  disabled?: boolean
} & WithTranslation;

class FieldTypeInternal extends React.Component<FieldTypeInternalProps> {
  static defaultProps = {
    disabled: false,
  }

  render() {
    const t = this.props.t;
    return <Block label={t("Type")} fieldSpec={latest.layer.type}
      data-wd-key={this.props.wdKey}
      error={this.props.error}
    >
      {this.props.disabled &&
        <InputString
          value={this.props.value}
          disabled={true}
        />
      }
      {!this.props.disabled &&
        <InputSelect
          options={[
            ['background', t('Background')],
            ['fill', t('Fill')],
            ['line', t('Line')],
            ['symbol', t('Symbol')],
            ['raster', t('Raster')],
            ['circle', t('Circle')],
            ['fill-extrusion', t('Fill Extrusion')],
            ['hillshade', t('Hillshade')],
            ['heatmap', t('Heatmap')],
          ]}
          onChange={this.props.onChange}
          value={this.props.value}
          data-wd-key={this.props.wdKey + ".select"}
        />
      }
    </Block>
  }
}

const FieldType = withTranslation()(FieldTypeInternal);
export default FieldType;

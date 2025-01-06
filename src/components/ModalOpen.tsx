import React, { FormEvent } from 'react'
import {MdFileUpload} from 'react-icons/md'
import {MdAddCircleOutline} from 'react-icons/md'
import FileReaderInput, { Result } from 'react-file-reader-input'
import { Trans, WithTranslation, withTranslation } from 'react-i18next';

import ModalLoading from './ModalLoading'
import Modal from './Modal'
import InputButton from './InputButton'
import InputUrl from './InputUrl'

import style from '../libs/style'
import publicStyles from '../config/styles.json'

type PublicStyleProps = {
  url: string
  thumbnailUrl: string
  title: string
  onSelect(...args: unknown[]): unknown
};

class PublicStyle extends React.Component<PublicStyleProps> {
  render() {
    return <div className="maputnik-public-style">
      <InputButton
        className="maputnik-public-style-button"
        aria-label={this.props.title}
        onClick={() => this.props.onSelect(this.props.url)}
      >
        <div className="maputnik-public-style-header">
          <div>{this.props.title}</div>
          <span className="maputnik-space" />
          <MdAddCircleOutline />
        </div>
        <div
          className="maputnik-public-style-thumbnail"
          style={{
            backgroundImage: `url(${this.props.thumbnailUrl})`
          }}
        ></div>
      </InputButton>
    </div>
  }
}

type ModalOpenInternalProps = {
  isOpen: boolean
  onOpenToggle(...args: unknown[]): unknown
  onStyleOpen(...args: unknown[]): unknown
} & WithTranslation;

type ModalOpenState = {
  styleUrl: string
  error?: string | null
  activeRequest?: any
  activeRequestUrl?: string | null
};

class ModalOpenInternal extends React.Component<ModalOpenInternalProps, ModalOpenState> {
  constructor(props: ModalOpenInternalProps) {
    super(props);
    this.state = {
      styleUrl: ""
    };
  }

  clearError() {
    this.setState({
      error: null
    })
  }

  onCancelActiveRequest(e: Event) {
    // Else the click propagates to the underlying modal
    if(e) e.stopPropagation();

    if(this.state.activeRequest) {
      this.state.activeRequest.abort();
      this.setState({
        activeRequest: null,
        activeRequestUrl: null
      });
    }
  }

  onStyleSelect = (styleUrl: string) => {
    this.clearError();

    let canceled: boolean = false;

    fetch(styleUrl, {
      mode: 'cors',
      credentials: "same-origin"
    })
      .then(function(response) {
        return response.json();
      })
      .then((body) => {
        if(canceled) {
          return;
        }

        this.setState({
          activeRequest: null,
          activeRequestUrl: null
        });

        const mapStyle = style.ensureStyleValidity(body)
        console.log('Loaded style ', mapStyle.id)
        this.props.onStyleOpen(mapStyle)
        this.onOpenToggle()
      })
      .catch((err) => {
        this.setState({
          error: `Failed to load: '${styleUrl}'`,
          activeRequest: null,
          activeRequestUrl: null
        });
        console.error(err);
        console.warn('Could not open the style URL', styleUrl)
      })

    this.setState({
      activeRequest: {
        abort: function() {
          canceled = true;
        }
      },
      activeRequestUrl: styleUrl
    })
  }

  onSubmitUrl = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    this.onStyleSelect(this.state.styleUrl);
  }

  onOpenFile = async () => {
    this.clearError();

    const pickerOpts = {
      types: [
        {
          description: "Style JSON",
          accept: {"application/json": [".json"]},
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };

    const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
    const file = await fileHandle.getFile();
    const content = await file.text();

    let mapStyle;
    try {
      mapStyle = JSON.parse(content)
    } catch (err) {
      this.setState({
        error: (err as Error).toString()
      });
      return;
    }
    mapStyle = style.ensureStyleValidity(mapStyle)
    this.props.onStyleOpen(mapStyle);
    this.onOpenToggle();
    return file;
  }

  onOpenToggle() {
    this.setState({
      styleUrl: ""
    });
    this.clearError();
    this.props.onOpenToggle();
  }

  onChangeUrl = (url: string) => {
    this.setState({
      styleUrl: url,
    });
  }

  render() {
    const t = this.props.t;
    const styleOptions = publicStyles.map(style => {
      return <PublicStyle
        key={style.id}
        url={style.url}
        title={style.title}
        thumbnailUrl={style.thumbnail}
        onSelect={this.onStyleSelect}
      />
    })

    let errorElement;
    if(this.state.error) {
      errorElement = (
        <div className="maputnik-modal-error">
          {this.state.error}
          <a href="#" onClick={() => this.clearError()} className="maputnik-modal-error-close">×</a>
        </div>
      );
    }

    return (
      <div>
        <Modal
          data-wd-key="modal:open"
          isOpen={this.props.isOpen}
          onOpenToggle={() => this.onOpenToggle()}
          title={t('Open Style')}
        >
          {errorElement}
          <section className="maputnik-modal-section">
            <h1>{t("Open local Style")}</h1>
            <p>{t("Open a local JSON style from your computer.")}</p>
            <div>
              <InputButton
                className="maputnik-big-button"
                onClick={this.onOpenFile}><MdFileUpload/> {t("Open Style")}
              </InputButton>
            </div>
          </section>

          <section className="maputnik-modal-section">
            <form onSubmit={this.onSubmitUrl}>
              <h1>{t("Load from URL")}</h1>
              <p>
                <Trans t={t}>
                  Load from a URL. Note that the URL must have <a href="https://enable-cors.org" target="_blank" rel="noopener noreferrer">CORS enabled</a>.
                </Trans>
              </p>
              <InputUrl
                aria-label={t("Style URL")}
                data-wd-key="modal:open.url.input"
                type="text"
                className="maputnik-input"
                default={t("Enter URL...")}
                value={this.state.styleUrl}
                onInput={this.onChangeUrl}
                onChange={this.onChangeUrl}
              />
              <div>
                <InputButton
                  data-wd-key="modal:open.url.button"
                  type="submit"
                  className="maputnik-big-button"
                  disabled={this.state.styleUrl.length < 1}
                >Load from URL</InputButton>
              </div>
            </form>
          </section>

          <section className="maputnik-modal-section maputnik-modal-section--shrink">
            <h1>{t("Gallery Styles")}</h1>
            <p>
              {t("Open one of the publicly available styles to start from.")}
            </p>
            <div className="maputnik-style-gallery-container">
              {styleOptions}
            </div>
          </section>
        </Modal>

        <ModalLoading
          isOpen={!!this.state.activeRequest}
          title={t('Loading style')}
          onCancel={(e: Event) => this.onCancelActiveRequest(e)}
          message={t("Loading: {{requestUrl}}", { requestUrl: this.state.activeRequestUrl })}
        />
      </div>
    )
  }
}

const ModalOpen = withTranslation()(ModalOpenInternal);
export default ModalOpen;

import * as $ from "JQuery";
import { ReactNode } from "react";
import React = require("react");
import ReactDOM = require("react-dom");

/**
 * <Explain Realitybox>
 */
export class Popup {
    root: JQuery;

    constructor(title: string, content: ReactNode, maxWidth: string) { // Change HTML to React
        const react = <><div>
            <div className="outer">
                <div className="container" style={{ maxWidth: maxWidth }}>
                    <div className="header">
                        <div>{title}</div>
                        <div>
                            <button className="btn" onClick={e => this.close()}>
                                <i className="material-icons">close</i>
                            </button>
                        </div>
                    </div>
                    <div className="content">
                        {[0].map(x => content)}
                    </div>
                </div>
            </div>
        </div>
        </>;
        let e = document.createElement("div");
        e.classList.add("viewer--popup");
        ReactDOM.render(react, e);
        this.root = $(e);
    }


    open() {
        $('body').append(this.root);
    }

    close() {
        this.root.detach();
    }
}
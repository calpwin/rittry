import { KeyValuePair } from "./key-value-pair";

export class CustomElementModel {
  constructor(
    public htmlCode: string,
    public uid: string,
    public appendTo: string = '<root/>',
    public styles: KeyValuePair[] = [],
    public attributes: KeyValuePair[] = []
  ) {}

  public get isRootElement() {
    return this.appendTo ===  '<root/>';
  }
}

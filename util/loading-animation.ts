export class LoadingAnimation {
  private symbols = ['|', '/', '-', '\\'];
  private index = 0;
  private encoder = new TextEncoder();
  private ESC = '\x1b';

  constructor(private text: string) {}

  public printNextTick(text: string = this.text) {
    Deno.stdout.writeSync(
      this.encoder.encode(
        `\r${this.symbols[this.index++ % this.symbols.length]} ${text}`
      )
    );
  }
}

class Window {
  constructor(size, executor) {
    this.size = size;
    this.executor = executor;
    this.items = [];
    this.previousResult = null;
    this.addedValue = null;
    this.deletedValue = null;
  }

  add(item) {
    this.addedValue = item;
    this.items.unshift(item);
    if (this.items.length > this.size) {
      this.deletedValue = this.items.pop();
    }
  }

  execute(item) {
    this.add(item);
    const result = this.items.length === this.size ?
      this.executor(this.items, this.previousResult, this.deletedValue, this.addedValue, this.size) :
      null;
    this.previousResult = result;
    return result;
  }
}

module.exports = Window;
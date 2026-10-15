export class DepositDTO {
  amount: number

  constructor(amount: number) {
    this.amount = amount
  }
 /* deposit(amount: number): void {
    if (amount <= 0) {
      return
    }

    this.balance = this.balance + amount
  }*/
}

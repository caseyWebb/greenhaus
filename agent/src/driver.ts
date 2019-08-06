import autobind from 'autobind-decorator'
import { Board, Led } from 'johnny-five'

import { BOARD, DRIVER_PWM_PIN } from './config'

export enum BoardType {
  RaspberryPi = 'pi'
}

class LedDriver {
  private readonly ready: Promise<void>

  private led!: Led

  constructor() {
    this.ready = new Promise(async (resolve) => {
      console.log('Initializing GPIO...')
      const io = await LedDriver.getBoardIO()
      const board = new Board({
        repl: false,
        io
      })
      board.on('ready', () => {
        this.led = new Led(DRIVER_PWM_PIN as any)
        console.log('GPIO initialized.')
        resolve()
      })
    })
  }

  @autobind
  public async setBrightness(percentage: number) {
    await this.ready
    // bound between 10% and 100%
    percentage = Math.min(Math.max(percentage, 10), 100)
    console.log(`Setting brightness to ${percentage}%`)
    this.led.on()
    this.led.brightness(255 - Math.round((percentage / 100) * 255))
  }

  private static async getBoardIO() {
    switch (BOARD) {
      case BoardType.RaspberryPi:
        const { default: PiIO } = await import('pi-io')
        return new PiIO()
      default:
        throw new Error(`Unknown board type "${BOARD}"`)
    }
  }
}

export const driver = new LedDriver()


/**
 * Use this file to define custom functions and blocks.
 * Read more at https://makecode.microbit.org/blocks/custom
 */

enum gigglebotWhichUniqueMotor {
    //% block="right motor"
    Right,
    //% block="left motor"
    Left
}
enum gigglebotWhichMotor {
    //% block="both motors"
    Both,
    //% block="right motor"
    Right,
    //% block="left motor"
    Left

}

enum gigglebotWhichDriveDirection {
    //% block="forward"
    Forward,
    //% block="backward"
    Backward
}

enum gigglebotWhichTurnDirection {
    //% block="right"
    Right,
    //% block="left"
    Left
}

enum gigglebotWhichUnitSystem {
    //% block="mm"
    mm,
    //% block="inches"
    inches
}

enum gigglebotWhichSpeed {
    //% block="slowest"
    Slowest = 25,
    //% block="slower"
    Slower = 35,
    //% block="normal"
    Normal = 50,
    //% block="faster"
    Faster = 75,
    //% block="fastest"
    Fastest = 90
}

enum gigglebotI2CCommands {
    GET_FIRMWARE_VERSION = 1,
    GET_MANUFACTURER,
    GET_BOARD,
    GET_VOLTAGE_BATTERY,
    GET_LINE_SENSORS,
    GET_LIGHT_SENSORS,
    GET_MOTOR_STATUS_RIGHT,
    GET_MOTOR_STATUS_LEFT,
    SET_MOTOR_POWER,
    SET_MOTOR_POWERS
}

enum gigglebotLineType {
    //% block="thin"
    Thin,
    //% block="thick"
    Thick
}

enum gigglebotLineColor {
    //% block="black"
    Black,
    //% block="white"
    White
}

enum gigglebotWhichEye {
    //% block="both eyes"
    Both,
    //% block="left eye"
    Left,
    //% block="right eye"
    Right
}

enum gigglebotEyeAction {
    //% block="open"
    Open,
    //% block="close"
    Close
}

enum gigglebotGigglePixels {
    Right,
    Left,
    SmileOne,
    SmileTwo,
    SmileThree,
    SmileFour,
    SmileFive,
    SmileSix,
    SmileSeven
}

enum gigglebotServoAction {
    //% block="right"
    Right,
    //% block="left"
    Left,
    //% block="both in synchro"
    Both,
    //% block="both in mirror"
    Mirror
}

enum gigglebotInequality {
    //% block="closer than"
    Closer,
    //% block="farther than"
    Farther
}

/**
 * Custom blocks
 */



//% weight=99 color=#46BFB1 icon="\uf0d1"
namespace gigglebot {
    /**
     */

    let ADDR = 0x04
    let LINE_FOLLOWER_THRESHOLD = 100
    let defaultMotorPower = 50;
    let trimLeft = 0
    let trimRight = 0
    let motorPowerLeft = (defaultMotorPower - trimLeft)
    let motorPowerRight = (defaultMotorPower - trimRight)
    let distanceSensorInitDone = false;
    let lineSensors = [0, 0]
    let lightSensors = [0, 0]


    /**
     * return current power setting of the left motor
     */
    export function leftPower() {
        return motorPowerLeft
    }

    /**
     * return current power setting of the right motor
     */
    export function rightPower() {
        return motorPowerRight
    }

    /**
     * Assigns a new power value to the left motor
     * Values from 101 through 127, and -128 through -101 are used to float the  motor.
     * @param leftpower new value for the power setting of the left motor (-100 < leftpower < 100)
     */
    export function setLeftPower(leftpower: number){
        motorPowerLeft = leftpower
    }
    /**
     * Assigns a new power value to the right motor
     * Values from 101 through 127, and -128 through -101 are used to float the  motor.
     * @param rightpower new value for the power setting of the right motor. (-100 < rightpower < 100)
     */
    //% rightpower.min= -100 rightpower.max = 100
    export function setRightPower(rightpower: number) {
        motorPowerRight = rightpower
    }

    /**
     * This code allows the Gigglebot to follow a line thin enough to fall between the two sensors. 
     * The robot will stop when both of its sensors will detect black.
     */
    export function followThinLine() {
        let all_black = false
        gigglebot.driveStraight(gigglebotWhichDriveDirection.Forward)
        while (!(all_black)) {
            lineSensors = gigglebot.lineSensorsRaw()
            if (gigglebot.lineTest(gigglebotLineColor.Black)) { 
                // We're done
                all_black = true
                gigglebot.stop()
            } else if (gigglebot.lineTest(gigglebotLineColor.White)) {
                // Line is between the two sensors, hopefully
                gigglebot.driveStraight(gigglebotWhichDriveDirection.Forward)
            } else if (lineSensors[0] < LINE_FOLLOWER_THRESHOLD) {
                // correct towards the right
                gigglebot.stop()
                motorPowerAssign(gigglebotWhichMotor.Left, motorPowerLeft + 5)
            } else if (lineSensors[1] < LINE_FOLLOWER_THRESHOLD) {
                // correct towards the let
                gigglebot.stop()
                motorPowerAssign(gigglebotWhichMotor.Right, motorPowerRight + 5)
            } else {
                // this should never happen
            }
        }
    }

    /**
     * Follows a line that is thicker than the space between the two sensors
     * The robot will stop when both of its sensors will detect white
     */
    function followThickLine() {
        let all_white = false
        gigglebot.driveStraight(gigglebotWhichDriveDirection.Forward)
        while (!(all_white)) {
            lineSensors = lineSensorsRaw()
            if (gigglebot.lineTest(gigglebotLineColor.White)) {
                all_white = true
                stop()
            } else if (gigglebot.lineTest(gigglebotLineColor.Black)) {
                driveStraight(gigglebotWhichDriveDirection.Forward)
            } else if (lineSensors[0] > LINE_FOLLOWER_THRESHOLD) {
                stop()
                turn(gigglebotWhichTurnDirection.Right)
            } else if (lineSensors[1] > LINE_FOLLOWER_THRESHOLD) {
                stop()
                turn(gigglebotWhichTurnDirection.Left)
            } else {
            }
        }
    }

    /**
    * Configures the Distance Sensor.
    * must be called before doing any distance sensor readings.
    * Called automatically when calling the distance sensor blocks
    */
    function distanceSensorConfigure() {
        distanceSensor.init()
        // set to long range (about 2.3 meters)
        // set final range signal rate limit to 0.1 MCPS (million counts per second)
        distanceSensor.setSignalRateLimitRaw(12) // 0.1 * (1 << 7) = 12.8
        distanceSensor.setVcselPulsePeriod(distanceSensor.vcselPeriodPreRange(), 18)
        distanceSensor.setVcselPulsePeriod(distanceSensor.vcselPeriodFinalRange(), 14)
        distanceSensor.startContinuous(0)
        distanceSensorInitDone = true
    }

    ////////////////////////////////////////////////////////////////////////
    ////////// BLOCKS
    ///////////////////////////////////////////////////////////////////////

    /**
     * Will let gigglebot move forward or backward for a number of milliseconds.
     * Distance covered during that time is related to the freshness of the batteries.
     * @param dir forward or backward; 
     * @param delay for how many milliseconds; eg: 1000
     */
    //% blockId="gigglebotDriveMillisec" block="drive %dir|for %delay|ms"
    //% delay.min=0
    export function driveMillisec(dir: gigglebotWhichDriveDirection, delay: number) {
        if (delay < 0) delay = 0
        driveStraight(dir)
        basic.pause(delay)
        stop()
    }

    /**
     * Will make gigglebot turn left and right for a number of milliseconds. How far it turns depends on the freshness of the batteries.
     * @param turn_dir turning left or right
     * @param delay for how many milliseconds; eg: 1000
     */
    //% blockId="gigglebotTurnMillisec" block="turn %turn_dir|for %delay|ms"
    //% delay.min=0
    export function turnMillisec(turn_dir: gigglebotWhichTurnDirection, delay: number) {
        if (delay < 0) delay = 0
        turn(turn_dir)
        basic.pause(delay)
        stop()
    }

    /** 
     * Gigglebot will spin on itself for the provided number of milliseconds, like a turn but staying in the same spot. Especially useful when drawing
     * @param turn_dir turning left or right
     * @param delay how many milliseconds; eg: 1000
     */
    //% blockId="gigglebotSpinMillisec" block="spin %turn_dir|for %delay|ms"
    //% delay.min=0
    export function gigglebotSpinMillisec(turn_dir: gigglebotWhichTurnDirection, delay: number) {
        if (delay < 0) delay = 0
        gigglebotSpin(turn_dir)
        basic.pause(delay)
        stop()
    }

    /** 
     * Gigglebot will drive forward while steering to one side for the provided number of milliseconds. 
     * Useful when it needs to go around an obstacle, or orbit around an object.
     * 0% means no steering, the same as the 'drive' block. 100% is the same as the 'turn' block.
     * @param percent the variation in power between left and right; eg: 0, 20, 50, 100
     * @param dir which direction to steer, left or right
     * @param delay for how many milliseconds; eg: 1000
     *      */
    //% blockId="gigglebotSteerMillisec" block="steer %percent| towards the %dir| for %delay| ms"
    //% percent.min=0 percent.max=100
    export function steerMillisec(percent: number, dir: gigglebotWhichTurnDirection, delay: number) {
        if (delay < 0) delay = 0
        if (percent < 0) percent = 0
        if (percent > 100) percent = 100
        steer(percent, dir)
        basic.pause(delay)
        stop()
    }

    /**
     * Will let gigglebot move forward or backward until told otherwise (either by a stop block or a turn block).
     * @param dir forward or backward
     */
    //% blockId="gigglebot_drive_straight" block="drive %dir"
    export function driveStraight(dir: gigglebotWhichDriveDirection) {
        let dir_factor = 1
        if (dir == gigglebotWhichDriveDirection.Backward) {
            dir_factor = -1
        }
        if (dir == gigglebotWhichDriveDirection.Forward) {
            dir_factor = 1
        }
        motorPowerAssignBoth(motorPowerLeft * dir_factor, motorPowerRight * dir_factor)
    }

    /**
     * Will make gigglebot turn left or right until told otherwise (by a stop block or a drive block).
     */
    //% blockId="gigglebotTurn" block="turn %turn_dir"
    export function turn(turn_dir: gigglebotWhichTurnDirection) {
        if (turn_dir == gigglebotWhichTurnDirection.Left) {
            motorPowerAssignBoth(0, motorPowerRight)
        }
        else {
            motorPowerAssignBoth(motorPowerLeft, 0)
        }
    }

    /** 
     * Gigglebot will spin on itself until told otherwise, like a turn but staying in the same spot. Especially useful when drawing.
     * @param turn_dir left or right;
     */
    //% blockId="gigglebotSpin" block="spin %turn_dir"
    export function gigglebotSpin(turn_dir: gigglebotWhichTurnDirection) {
        if (turn_dir == gigglebotWhichTurnDirection.Left) {
            motorPowerAssignBoth(-1 * motorPowerLeft, motorPowerRight)
        }
        else {
            motorPowerAssignBoth(motorPowerLeft, -1 * motorPowerRight)
        }
    }

    /** 
     * Gigglebot will drive forward while steering to one side. 
     * Useful when it needs to go around an obstacle, or orbit around an object.
     * 0% means no steering, the same as the 'drive' block. 100% is the same as the 'turn' block.
     * @param percent value between 0 and 100 to control the amount of steering
     * @param dir to the left or to the right
     */
    //% blockId="gigglebotSteer" block="steer %percent| towards the %dir"
    //% percent.min=0 percent.max=100
    export function steer(percent: number, dir: gigglebotWhichTurnDirection) {
        percent = Math.min(Math.max(percent, 0), 100)
        let correctedMotorPowerLeft = motorPowerLeft
        let correctedMotorPowerRight = motorPowerRight
        if (dir == gigglebotWhichTurnDirection.Left) {
            correctedMotorPowerLeft = motorPowerLeft - (motorPowerLeft * percent) / 100
            correctedMotorPowerRight = motorPowerRight + (motorPowerRight * percent) / 100
        } else {
            correctedMotorPowerLeft = motorPowerLeft + (motorPowerLeft * percent) / 100
            correctedMotorPowerRight = motorPowerRight - (motorPowerRight * percent) / 100
        }
        motorPowerAssignBoth(correctedMotorPowerLeft, correctedMotorPowerRight)
    }

    /**
    * stops the robot.
    */
    //% blockId="gigglebot_stop" block="stop"
    export function stop() {
        motorPowerAssign(gigglebotWhichMotor.Both, 0)
    }

    /**
     * You can set the speed for each individual motor or both together. The higher the speed the less control the robot has.
     * You may need to correct the robot (see block in "more..." section).  A faster robot needs more correction than a slower one.
     * If you want to follow a line,  it will work best at a lower speed.
     * Actual speed is dependent on the freshness of the batteries.
     * @param motor: left, right or both motors
     * @param speed: how fast the robot goes.
     */
    //% blockId="gigglebot_set_speed" block="set %motor | speed to %speed"
    //% speed.min=-100 speed.max=100
    export function setSpeed(motor: gigglebotWhichMotor, speed: gigglebotWhichSpeed) {
        speed = Math.min(Math.max(speed, -100), 100)
        if (motor != gigglebotWhichMotor.Left) {
            if (speed > 0)
                motorPowerRight = speed - trimRight;
            else 
                motorPowerRight = speed + trimRight;
            
        }
        if (motor != gigglebotWhichMotor.Right) {
            if (speed > 0)
                motorPowerLeft = speed - trimLeft;
            else
            motorPowerLeft = speed + trimLeft;
        }
        motorPowerAssignBoth(motorPowerLeft, motorPowerRight)
    }

  ///////////////////////////////////////////////////////////////////////
    /////////// LINE FOLLOWER BLOCKS
    ///////////////////////////////////////////////////////////////////////
    /**
     * A thin black line would fall between the two sensors. The gigglebot will stop when both sensors are reading black.
     * A thick black line would have the two sensors on top of it at all times. The gigglebot will stop when both sensors are reading white.
     * @param type_of_line thin line or thick line
    */
    //% blockId="gigglebot_follow_line" block="follow a %type_of_line| black line"
    export function lineFollow(type_of_line: gigglebotLineType) {
        if (type_of_line == gigglebotLineType.Thin) {
            followThinLine()
        }
        else {
            followThickLine()
        }
    }

    /**
     * Will return true if the whole line sensor is reading either black or white.
     * @param color: black or white
    */
    //% blockId="gigglebot_test_line" block="%which|line is detected"
    //% advanced=true
    export function lineTest(color: gigglebotLineColor): boolean {
        lineSensorsRaw()
        for (let _i = 0; _i < lineSensors.length; _i++) {
            if (color == gigglebotLineColor.Black && lineSensors[_i] > LINE_FOLLOWER_THRESHOLD) {
                return false
            }
            if (color == gigglebotLineColor.White && lineSensors[_i] < LINE_FOLLOWER_THRESHOLD) {
                return false
            }
        }
        return true
    }

    /**
    * Reads left or right line sensor
    * @param which left or right
    */
    //% blockId="gigglebot_read_line_sensors" block="%which|line sensor"
    //% advanced=true
    export function lineReadSensor(which: gigglebotWhichTurnDirection): number {
        lineSensorsRaw()
        return lineSensors[which]
    }


    ///////////////////////////////////////////////////////////////////////
    /////////// LIGHT SENSOR BLOCKS
    ///////////////////////////////////////////////////////////////////////
    /**
     * Will follow a spotlight shone on its eyes. If the spotlight disappears the gigglebot will stop.
     */
    //% blockId="gigglebot_follow_light" block="follow light"
    export function lightFollow() {
        let diff = 0
        let current_lights = lightSensorsRaw()
        diff = Math.abs((current_lights[0] - current_lights[1])) / 10;
        if (current_lights[0] > current_lights[1]) {
            // it's brighter to the right
            motorPowerAssignBoth(motorPowerLeft, motorPowerRight - diff)
        }
        else {
            // it's brighter to the left
            motorPowerAssignBoth(motorPowerLeft - diff, motorPowerRight)
        }
    }

    /**
    * Reads left or right light sensor. 
    * The light sensors are placed in front of each eye neopixel, they're tiny! 
    * The range is 0 through 1023, although in reality rarely above ~950.
    * @param which left or right
    */
    //% blockId="gigglebot_read_light_sensors" block="%which|light sensor"
    //% advanced=true
    export function lightReadSensor(which: gigglebotWhichTurnDirection): number {
        lightSensorsRaw()
        return lightSensors[which]
}

    ////////////////////////////////////////////////////////////////////////
    /////////// DISTANCE SENSOR
    ///////////////////////////////////////////////////////////////////////

    /**
     * Get a reading of how far an obstacle is from the distanse sensor.
     */
    //% blockId="distanceSensorReadRangeContinuous" block="distance to obstacle (mm)"
    //% advanced=true
    export function distanceSensorReadRangeContinuous(): number {
        if (distanceSensorInitDone == false) {
            distanceSensorConfigure()
        }
        return distanceSensor.readRangeContinuousMillimeters()
    }

    /**
     * Test for the presence of an obstacle.
     * @param inequality less than or more than, closer than or farther than
     * @param dist how many millimeters; eg: 100
     */
    //% blockId="distanceSensorTestForObstacle" block="obstacle is %inequality| %dist| mm"
    export function distanceSensorTestForObstacle(inequality: gigglebotInequality, dist: number): boolean {
        if (distanceSensorInitDone == false) {
            distanceSensorConfigure()
        }
        if (inequality == gigglebotInequality.Closer) {
            if (distanceSensor.readRangeContinuousMillimeters() < dist) {
                return true
            }
            else {
                return false
            }
        }
        else if (inequality == gigglebotInequality.Farther) {
            if (distanceSensor.readRangeContinuousMillimeters() > dist) {
                return true
            }
            else {
                return false
            }
        }
        return false
    }

    /**
     * Distance Sensor: takes a single reading.
     */
    export function distanceSensorReadRangeSingle(): number {
        if (distanceSensorInitDone == false) {
            distanceSensorConfigure()
        }
        return distanceSensor.readRangeSingleMillimeters()
    }




    ///////////////////////////////////////////////////////////////////////
    /////////// MORE BLOCKS
    ///////////////////////////////////////////////////////////////////////


    /////////// SERVO BLOCKS

    //% blockId="gigglebot_servo" block="set %which|servo to |%degree"
    //% advanced=true
    //% degree.min=5 degree.max=175
    export function servoMove(which: gigglebotServoAction, degree: number) {
        if (which == gigglebotServoAction.Right) {
            pins.servoWritePin(AnalogPin.P13, degree)
        }
        else if (which == gigglebotServoAction.Left) {
            pins.servoWritePin(AnalogPin.P14, degree)
        }
        else if (which == gigglebotServoAction.Both) {
            pins.servoWritePin(AnalogPin.P13, degree)
            pins.servoWritePin(AnalogPin.P14, degree)
        }
        else if (which == gigglebotServoAction.Mirror) {
            pins.servoWritePin(AnalogPin.P13, degree)
            pins.servoWritePin(AnalogPin.P14, 180 - degree)
        }
    }


    /**
     * This allows the user to correct the motors on the Gigglebot if it's not driving straight
     * @param dir: if the gigglebot drives to the left, then correct to the right. Vice versa. 
     * @param trim_value: a correction value between 0 and 100, but most likely below 10
     */
    //% blockId="gigglebot_trim" block="correct towards %dir|by %trim_value"
    //% advanced=true
    export function motorTrimSet(dir: gigglebotWhichTurnDirection, trim_value: number) {
        if (trim_value < 0) trim_value = 0
        if (dir == gigglebotWhichTurnDirection.Left) {
            trimLeft = trim_value
            motorPowerLeft = defaultMotorPower - trimLeft
        }
        if (dir == gigglebotWhichTurnDirection.Right) {
            trimRight = trim_value
            motorPowerRight = defaultMotorPower - trimRight
        }
    }

    /** 
     * Assigns power to a motor, or the same power to both motors
     * Values from 101 through 127, and -128 through -101 are used to float the  motor.
     * @param motor:  left or right motor, or both
     * @param power: a value between -100 and 100
     */
    //% blockId="gigglebot_set_motor" block="set power on %motor| to | %power"
    //% advanced=true
    export function motorPowerAssign(motor: gigglebotWhichMotor, power: number) {
        let buf = pins.createBuffer(3)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.SET_MOTOR_POWER)
        buf.setNumber(NumberFormat.UInt8BE, 2, power)
        // activate right motor
        if (motor == gigglebotWhichMotor.Right) {
            buf.setNumber(NumberFormat.UInt8BE, 1, 0x01)
        }
        // activate left motor
        else if (motor == gigglebotWhichMotor.Left) {
            buf.setNumber(NumberFormat.UInt8BE, 1, 0x02)
        }
        // activate both motors
        else if (motor == gigglebotWhichMotor.Both) {
            buf.setNumber(NumberFormat.UInt8BE, 1, 0x03)
        }
        pins.i2cWriteBuffer(ADDR, buf, false);
    }

    /**
     * Assigns potentially different powers to both motors in one call.  
     * Values from 101 through 127, and -128 through -101 are used to float the  motor.
     * @param left_power: the power to assign to the left motor (between -100 and 100)
     * @param right_power: the power to assign to the right motor (between -100 and 100)
     */
    //% blockId="gigglebot_set_motors" block="set left power to %left_power|and right to | %right_power"
    //% advanced=true
    export function motorPowerAssignBoth(left_power: number, right_power: number) {
        let buf = pins.createBuffer(3)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.SET_MOTOR_POWERS)
        buf.setNumber(NumberFormat.UInt8BE, 1, right_power)
        buf.setNumber(NumberFormat.UInt8BE, 2, left_power)
        pins.i2cWriteBuffer(ADDR, buf, false);
    }

    /**
     * Displays the current battery voltage. Anything lower than 3.4 is too low to run the motors
     */
    //% blockId="gigglebot_show_voltage" block="show battery voltage (mv)"
    //% advanced=true
    export function voltageShow() {
        let voltage = voltageBattery()
        basic.showNumber(voltage)
    }

    //% blockId="gigglebot_get_firmware" block="firmware version number"
    //% advanced=true
    export function firmwareVersion(): number {
        /**
         * returns the firmware version that is installed.
         */
        let buf = pins.createBuffer(1)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.GET_FIRMWARE_VERSION)
        pins.i2cWriteBuffer(ADDR, buf)
        let val = pins.i2cReadBuffer(ADDR, 2)
        return val.getNumber(NumberFormat.UInt16BE, 0);
    }

    //% blockId="gigglebot_get_voltage" block="battery voltage (mv)"
    //% advanced=true
    export function voltageBattery(): number {
        /**
         * Returns the voltage level of the batteries.
         */
        let buf = pins.createBuffer(1)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.GET_VOLTAGE_BATTERY)
        pins.i2cWriteBuffer(ADDR, buf)
        let val = pins.i2cReadBuffer(ADDR, 2)
        return val.getNumber(NumberFormat.UInt16BE, 0);
    }

    /**
    * Reads the two line sensors
    */
    //% blockId="gigglebot_read_raw_line_sensors" block="raw line sensors (x2)"
    //% advanced=true
    export function lineSensorsRaw(): number[] {
        let buf = pins.createBuffer(1)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.GET_LINE_SENSORS)
        pins.i2cWriteBuffer(ADDR, buf)
        let raw_buffer = pins.i2cReadBuffer(ADDR, 3)
        for (let _i = 0; _i < 2; _i++) {
            lineSensors[_i] = (raw_buffer.getNumber(NumberFormat.UInt8BE, _i) << 2)
            lineSensors[_i] |= (((raw_buffer.getNumber(NumberFormat.UInt8BE, 2) << (_i * 2)) & 0xC0) >> 6)
            lineSensors[_i] = 1023 - lineSensors[_i]
        }
        return lineSensors
    }


    //% blockId="gigglebot_read_raw_light_sensors" block="raw light sensors (x2)"
    //% advanced=true
    export function lightSensorsRaw(): number[] {
        let buf = pins.createBuffer(1)
        buf.setNumber(NumberFormat.UInt8BE, 0, gigglebotI2CCommands.GET_LIGHT_SENSORS)
        pins.i2cWriteBuffer(ADDR, buf)
        let raw_buffer = pins.i2cReadBuffer(ADDR, 3)
        for (let _i = 0; _i < 2; _i++) {
            lightSensors[_i] = (raw_buffer.getNumber(NumberFormat.UInt8BE, _i) << 2)
            lightSensors[_i] |= (((raw_buffer.getNumber(NumberFormat.UInt8BE, 2) << (_i * 2)) & 0xC0) >> 6)
            lightSensors[_i] = 1023 - lightSensors[_i]
        }
        // serial.writeNumbers(light_sensor)
        return lightSensors
}
}
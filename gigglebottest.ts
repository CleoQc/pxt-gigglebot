{
    gigglebot.driveMillisec(gigglebotWhichDriveDirection.Forward, 1000)
    gigglebot.driveMillisec(gigglebotWhichDriveDirection.Backward, 1000)
    gigglebot.turnMillisec(gigglebotWhichTurnDirection.Right, 1000)
    gigglebot.turnMillisec(gigglebotWhichTurnDirection.Left, 1000)
    gigglebot.SpinMillisec(gigglebotWhichTurnDirection.Right, 1000)
    gigglebot.SpinMillisec(gigglebotWhichTurnDirection.Left, 1000)
    gigglebot.steerMillisec(50, gigglebotWhichTurnDirection.Right, 1000)
    gigglebot.steerMillisec(50, gigglebotWhichTurnDirection.Left, 1000)
    gigglebot.servoMove(gigglebotServoAction.Right, 90)
    gigglebot.servoMove(gigglebotServoAction.Left, 45)
    basic.pause(1000)
    gigglebot.servoMove(gigglebotServoAction.Both, 30)
    basic.pause(1000)
    gigglebot.servoMove(gigglebotServoAction.Mirror, 120)
}
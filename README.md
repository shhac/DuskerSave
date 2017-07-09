# DuskerSave

### Usage

 1. Store save file (_universedata.txt_) in a variable, e.g. `universedata`
 2. `let loadedSaveFile = new DuskerSave(universedata);`
 3. Perform edits
 4. `let generatedSaveFile = loadedSaveFile.toString()`
 5. Save this string back as _universedata.txt_

If you only want to parse a specific line, you can use it's own class (e.g. `new DuskerDrone('12345', 'FOO=Bar:Fizz=Buzz')`) or pass it as the only line into `DuskerSave`

### Navigating save file

Known types are parsed into an _Object_ with it's data in the _config_ property.
Each of these _Objects_ can be `.toString`d into their _universedata_ line

To help you get around faster, there are some methods to find related items,

e.g. to find the slots on your ship

    loadedSaveFile.PLAYER[0]
        .ship(loadedSaveFile) // DuskerObj, your ship
        .owns(loadedSaveFile) // Object of Arrays of the different known types
        .SLOT // Array of DuskerSlot

e.g. to find which drone has an item

    loadedSaveFile.INVITMD[0] // some item
        .owner(loadedSaveFile) // Object of Arrays of the different known types
        .DRONE // Array of DuskerDrone, in this case either empty or length 1

### Notes

Any loss of data caused to your game is your own responsibility. Always keep backups.


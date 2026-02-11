# magnetar scouting app front end
## eklenecekler
fotoğraf üzerinden robot konumu seçme
"Özet & Data" sayfasında özet kısmında "na" yerine belirtilmemiş / undefined 
hafif bir kod temizliği
## bilinen buglar
"Özet & Data" sayfasında aşağı kaydırdıkça arkaplan kesiliyor

## şu anki data output formatı
scouterInitials;eventName;matchLevel;matchNumber;robotPosition;autoScored;autoNeutralBrought;level1Climb;autoPickupDepot;autoPickupOutpost;autoPickupNeutral;teleopScored;teleopNeutralPassed;teleopPickupDepot;teleopPickupOutpost;teleopPickupGround;climbLevel;driverSkill;defenseRating;robotSpeed;crossedBump;underTrench;proneToTip;disabled;goodAllianceMember;couldBeDefended;unnecessaryFoul;autoNotes;teleopNotes;notes

matchLevel: qm = quals, f = finals
robotPosition: r1 r2 r3 b1 b2 b3  (red 1,2,3 ve blue 1,2,3)
level1Climb: c climbed, t attempted, n failed, na unknown
driverSkill: 0 ineffective, 1 average, 2 effective, x unobserved, na unknown
defenseRating: 0 none, 1 below, 2 avg, 3 good, 4 great, na unknown
Evet/Hayır radyo butonları: 1 evet, 0 hayır, na (not answered)
Checkboxes: 1 checked, 0 unchecked

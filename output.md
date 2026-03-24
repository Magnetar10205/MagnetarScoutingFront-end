# magnetar scouting app front end 1.0!!!
## özellikler 
**6 adımlı scouting formu**
1. maç bilgisi
2. otonom
3. tele op
4. endgame/sürücü
5. özellikler
6. özet/data

**zorunlu alan kontrolü**\
1 numaralı sayfadaki bilgilerden önemli olanlar doldurulmadan ileri gidilmez, toast notification şeklinde doldurmayan bilgiler uyarılır

**harita seçimi**\
maç bilgisi sayfasında robotun nereden başladığı işaretlenebilir, 2. ve 3. sayfalarda nerelerden atış yapıldığı işaretlenebilir, noktalar geri alınıp sürüklenebilir.

**i18n**\
hem türkçe hem ingilizce dil desteği

**özet ve data çıktı alanı**\
datanın kopyalanmasına ve özet şeklinde görülmesine izin verilir.

## yapılacaklar ( en önemliden en önemsize )
henüz kesinleştiremesem de bir yere magnetar logosunun koyulması

## bilinen buglar
test ederken bu versiyonda gördüğüm bir bug yok, bulursanız lütfen whatsapp üzerinden yazın

# şu anki data output formatı
**1-scouterInitials**
_gözlemcinin isminin ilk harfleri_

çıktısı: ABC (büyük harfe dönüştürülür, boşluklar kaldırılır)\
boş bırakılamaz, bırakılırsa sıradakine geçilmesine izin verilmez.

**2-eventName**
_etkinlik adı_

çıktısı: herhangi yazı (data çıkışı bozulmaması adına ";" karakteri yazılırsa "," ile değiştirilir)\
boş bırakılamaz, bırakılırsa sıradaki sayfaya geçilmesine izin verilmez

**3-matchLevel**
_maç düzeyi_

çıktısı: qm (quals), f (finals)\
boş bırakılamaz,bırakılırsa sıradaki sayfaya geçilmesine izin verilmez

**4-matchNumber**
_maç numarası_

çıktısı: sayı\
boş bırakılamaz, bırakılırsa sıradaki sayfaya geçilmesine izin verilmez

**5-teamCode**
_takım kodu_

çıktısı: sayı\
boş bırakılır ise "na" yazar.

**6-robotPosition**
_robot konumu_

çıktısı: r1, r2, r3, b1, b2, b3 (red 1,2,3 ve blue 1,2,3 gibi)\
boş bırakılamaz, bırakılırsa sıradaki sayfaya geçilmesine izin verilmez

**7-autoStartX**
_otonom başlangıç X ekseni_

çıktısı: otonom yarışmada start konumunun X eksenindeki yeri, ondalıklı sayı olarak çıktı verir, örneğin 0.512\
boş bırakılır ise "na" yazar.

**8-autoStartY**
_otonom başlangıç Y ekseni_

çıktısı: otonom yarışmada start konumunun X eksenindeki yeri, ondalıklı sayı olarak çıktı verir, örneğin 0.512\
boş bırakılır ise "na" yazar.

**9-autoShotsXY**
_otonom atışların yapıldığı konumlar listesi_

çıktısı: x ve y ekseni birlikte olmak üzere "|" karakteriyle ayrılmış bir liste, örneğin x,y|x,y|x,y\
örnek: 0.123,0.456|0.777,0.222\
boş bırakılır ise "na" yazar.

**10-teleShotsXY**
_tele-op atışların yapıldığı konumlar listesi_

9# ile aynı formatta.\
boş bırakılır ise "na" yazar.

**11-autoScored**
_otonom skor_

çıktısı: tam sayı, örnek 3,5,7...\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**12-autoNeutralBrought**
_otonomda nötr bölgeden getirilen yük sayısı_

çıktısı: tam sayı, örnek 3,5,7...\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**13-level1Climb**
_tırmanış durumu_

çıktısı:

c = tırmandı (climbed)\
t = denendi (tried)\
n = başarısız oldu (failed)\
boş bırakılır ise "na" yazar.\

**14-autoPickupDepot**
_depodan yük aldı mı?_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**15-autoPickupOutpost**
_outposttan yük alındı mı?_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**16-autoPickupNeutral**

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**17-teleopScored**
_teleop skor_

çıktısı: tam sayı, örnek 3,5,7...\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**18-teleopNeutralPassed**
_nötr alandan pas verilen yük sayısı_

çıktısı: tam sayı, örnek 3,5,7...\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**19-teleopPickupDepot**
_teleopta depodan alındı mı_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**20-teleopPickupOutpost**
_teleopta outposttan alındı mı_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**21-teleopPickupGround**
_teleopta yerden alındı mı_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılamaz, hiç ellenmez ise "0" yazar.

**22-climbLevel**
_tırmanış seviyesi_

çıktısı: kullanıcının girdiği çoktan seçmeli şık\
örnek: 0,1,2,3\
boş bırakılır ise "na" yazar.

**23-driverSkill**
_sürücü yeteneği_

çıktısı:\
0 = etkisiz / ineffective\
1 = ortalama / average\
2 = etkili / effective\
x = gözlemlenmemiş /unobserved\
boş bırakılır ise "na" yazar.

**24-defenseRating**
_defans puanlaması_

çıktısı:\
0 = defans oynamadı\
1 = ortalamanın altında\
2 = ortalama\
3 = iyi\
4 = çok iyi\
boş bırakılır ise "na" yazar.

**25-robotSpeed**
_robot hızı_

çıktısı: kullanıcının girdiği çoktan seçmeli şık\
örnek: 0,1,2,3\
boş bırakılır ise "na" yazar.

**26-crossedBump**
_bumpın üzerinden geçti mi?_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**27-underTrench**
_trenchin altından geçti mi_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**28-proneToTip**
_düşmeye meyilli mi_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**29-disabled**
_devre dışı bırakıldı mı_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**30-goodAllianceMember**
_iyi bir ittifak üyesi mi_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**31-couldBeDefended**
_savunulabildi mi?_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**32-unnecessaryFoul**
_gereksiz faulde bulundu mu?_

çıktı: 1 (evet) or 0 (hayır)\
boş bırakılır ise "na" yazar.

**33-autoNotes**
_otonom notları_

çıktısı: kullanıcı ne yazarsa ( data çıktısı bozulmasın diye ";" kullanılırsa "," karakterine dönüştürülür)\
boş bırakılır ise "na" yazar.

**34-teleopNotes**
_teleop notları_

çıktısı: kullanıcı ne yazarsa ( data çıktısı bozulmasın diye ";" kullanılırsa "," karakterine dönüştürülür)\
boş bırakılır ise "na" yazar.

**35-notes**
_genel notlar_

çıktısı: kullanıcı ne yazarsa ( data çıktısı bozulmasın diye ";" kullanılırsa "," karakterine dönüştürülür)\
boş bırakılır ise "na" yazar.

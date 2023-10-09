import { parsec, getKey } from "./lib";
import qs from "node:querystring";



for (let index = 0; index < 1000; index++) {
    console.time('process')
    const str = "year=2023&month=october&param1=value1&param2=value2&param3=value3&param4=value4&param5=value5&param6=value6&param7=value7&param8=value8&param9=value9&param10=value10&param11=value11&param12=value12&param13=value13&param14=value14&param15=value15&param16=value16&param17=value17&param18=value18&param19=value19&param20=value20&param21=value21&param22=value22&param23=value23&param24=value24&param25=value25&param26=value26&param27=value27&param28=value28&param29=value29&param30=value30&param31=value31&param32=value32&param33=value33&param34=value34&param35=value35&param36=value36&param37=value37&param38=value38&param39=value39&param40=value40&param41=value41&param42=value42&param43=value43&param44=value44&param45=value45&param46=value46&param47=value47&param48=value48&param49=value49&param50=value50&param51=value51&param52=value52&param53=value53&param54=value54&param55=value55&param56=value56&param57=value57&param58=value58&param59=value59&param60=value60&param61=value61&param62=value62&param63=value63&param64=value64&param65=value65&param66=value66&param67=value67&param68=value68&param69=value69&param70=value70&param71=value71&param72=value72&param73=value73&param74=value74&param75=value75&param76=value76&param77=value77&param78=value78&param79=value79&param80=value80&param81=value81&param82=value82&param83=value83&param84=value84&param85=value85&param86=value86&param87=value87&param88=value88&param89=value89&param90=value90&param91=value91&param92=value92&param93=value93&param94=value94&param95=value95&param96=value96&param97=value97&param98=value98&param99=value99&param100=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTY5NjU1MjMzMywiZXhwIjoxNjk2NTU1OTMzfQ.AA9xbDRMaeoyR-Sg20vjasXJrDgJzalmyH2MBN6dUNE";
    const rest = parsec(str)
    
    // console.log(qs.parse(str))
    // console.log(getKey(rest, "year"))
    console.log(rest)
    console.timeLog('process')
    
}








// const str = "/query?token=bum"

// console.log(str.split("?")[1])
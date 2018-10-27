@if(!isset($name))
    This is the pharmarcy info you have chosen:
    Pharmacy name: {{$pharmacyName}},
    Pharmacy address: {{$pharmacyAddress}}, {{$city}}
@else
    <p><b>Hi {{$name}},</b></p>
    <p><b>Please find your Prescription Savings Card attached.</b></p>

    <p style="font-size: 15px;"><i>You are receiving this email because you have verbally consented to receiving this
            email and attached documents on {{$time}}.</i></p>
    @if(isset($pharmacyName))
        <p>This is the pharmarcy info you have chosen:<p>
        <p>Pharmacy name: {{$pharmacyName}},</p>
        <p>Pharmacy address: {{$pharmacyAddress}}, {{$city}}</p>
    @endif
@endif

--
<img src="{{$docaniLogoUrl}}" width="60" height="30">
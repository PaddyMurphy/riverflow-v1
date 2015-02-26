<!doctype html>
<html class="no-js" lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <title>Riverflow</title>

  <meta name="viewport" content="width=device-width">
  <link href='http://fonts.googleapis.com/css?family=Lato&subset=latin,latin-ext' rel='stylesheet' type='text/css'>
  <link rel="stylesheet" type="text/css" href="styles/css/main.css">
</head>

<body>
    <div class="main">
        <div class="loading-message hidden">
            hold on loading some stuff...
        </div>

        <div class="tile nameHeadline">
            <span class="logo">River Flow</span>
            <span class="tagline">Texas Edition</span>
        </div>

        <!-- <div class="tile siteName"></div> -->
        <div class="tile select-river-wrapper">
            <form action="#" method="get" id="formRiver">
                <select id="selectRiver" name="selectRiver">
                    <option class="strong" selected value="">
                        -- Texas Rivers and Streams --
                    </option>

                    <option class="strong" value="">
                        -- Brazos River Basin --
                    </option>

                    <option value="08089000">
                        Brazos River : Palo Pinto
                    </option>

                    <option value="08091000">
                        Brazos River : Glen Rose
                    </option>

                    <option value="08096500">
                        Brazos River : Waco
                    </option>

                    <option value="08108700">
                        Brazos River : Bryan
                    </option>

                    <option class="strong" value="">
                        -- Colorado River Basin --
                    </option>

                    <option value="08155500">
                        Barton Springs
                    </option>

                    <option value="08155400">
                        Barton Creek : Above Barton Springs
                    </option>

                    <option value="08155300">
                        Barton Creek : Loop 360
                    </option>

                    <option value="08155240">
                        Barton Creek : Lost Ck Blvd
                    </option>

                    <option value="08155200">
                        Barton Creek : SH 71
                    </option>

                    <option value="08159200">
                        Colorado River : Bastrop
                    </option>

                    <option value="08159000">
                        Onion Creek : Hwy 183
                    </option>

                    <option value="08151500">
                        Llano River : Llano
                    </option>

                    <option value="08150700">
                        Llano River : Mason
                    </option>

                    <option value="08150000">
                        Llano River : Junction
                    </option>

                    <option class="strong" value="">
                        -- Guadalupe River Basin --
                    </option>

                    <option value="08167500">
                        Guadalupe River : Spring Branch
                    </option>

                    <option value="08167800">
                        Guadalupe River : Sattler
                    </option>

                    <option value="08168500">
                        Comal River : New Braunfels
                    </option>

                    <option value="08169792">
                        Guadalupe River : FM 1117 nr Seguin
                    </option>

                    <option value="08173900">
                        Guadalupe River : Gonzales
                    </option>

                    <option value="08170500">
                        San Marcos River : San Marcos
                    </option>

                    <option value="08172000">
                        San Marcos River : Luling
                    </option>

                    <option value="08171000">
                        Blanco River : Wimberley
                    </option>

                    <option value="08171300">
                        Blanco River : Kyle
                    </option>

                    <option class="strong" value="">
                        -- Nueces River Basin --
                    </option>

                    <option value="08190000">
                        Nueces River : Laguna
                    </option>

                    <option value="08195000">
                        Frio River : Concan
                    </option>

                    <option class="strong" value="">
                        -- Rio Grande Basin --
                    </option>

                    <option value="08374550">
                        Rio Grande : Castolon
                    </option>

                    <option value="08375300">
                        Rio Grande : Big Bend
                    </option>

                    <option value="08420500">
                        Pecos River : Pecos
                    </option>

                    <option value="08446500">
                        Pecos River : Girvin
                    </option>

                    <option class="strong" value="">
                        -- San Antonio River Basin --
                    </option>

                    <option value="08178880">
                        Medina River : Bandera
                    </option>

                    <option value="08188500">
                        San Antonio River : Goliad
                    </option>
                </select>
            </form>
        </div>

        <div class="tile-group">
            <div class="tile flowRate"></div>
            <div class="tile conditions"></div>
            <div class="tile recentValueWrapper"></div>
        </div>

        <div class="tile" id="graph">
            <div class="graph-wrapper"></div>
        </div>

        <div class="images">
            <div class="tile-wrapper image-wrapper"></div>
        </div>
    </div>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
    <!-- TODO: use zepto instead <script src="javascript/zepto.min.js"></script> -->
    <script src="javascript/riverflow.js"></script>
</body>
</html>

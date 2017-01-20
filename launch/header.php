<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<link rel="profile" href="http://gmpg.org/xfn/11">
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>">
<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
    <!-- Status: Shows if the subscription succeeded or not. -->
    <div id="loading">
        <span class="status icon"></span>
    </div>
    
    <!-- Header: Your site logo, tagline and project status. -->
    <header class="row" id="header">
        <div class="content">
            <?php
            $logourl = get_theme_mod('launch_logo_image', get_template_directory_uri().'/assets/images/logo.png');
            if(!empty($logourl)) :
            ?>
            <span class="logo" style="background-image: url('<?php echo $logourl; ?>')"><?php bloginfo('name'); ?></span>
            <?php else: ?>
            <span><?php bloginfo('name'); ?></span>
            <?php endif; ?>
            
        </div>

        <?php
            $launch_percentage = get_theme_mod('launch_percentage', 75);
            if(!empty($launch_percentage)) :
        ?>
            <div class="status" style="width: <?php echo $launch_percentage; ?>%;">
            <span><?php echo $launch_percentage; ?>%</span>
        <?php else: ?>
            <div class="status">
        <?php endif; ?>
        </div>
    </header>
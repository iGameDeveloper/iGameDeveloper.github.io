<?php
/*
 * Hey
 * Only edit this file if you know what you're doing or make a backup before editing it
 * Happy Blogging
*/

include (TEMPLATEPATH . '/assets/inc/customizer.php');


require_once(TEMPLATEPATH . "/assets/helpers/ajax-class.php");
ajaxclass::get_instance();



function launch_setup() {

	// Takes care of the <title> tag. https://codex.wordpress.org/Title_Tag
	add_theme_support('title-tag');

    // Add custom background support. http://codex.wordpress.org/Custom_Backgrounds
    add_theme_support('custom-background', array(
    	'default-color' => 'f5f5f5',
        'default-image' => get_stylesheet_directory_uri() . '/assets/images/bg.jpg',
        'default-position-x' => 'center',
        'default-repeat' => 'no-repeat',
        'default-attachment' => 'fixed'
    ));
}

add_action( 'after_setup_theme', 'launch_setup' );

// To add backwards compatibility for titles
if ( ! function_exists( '_wp_render_title_tag' ) ) {
	function launch_render_title() {
?>
<title><?php wp_title( '|', true, 'right' ); ?></title>
<?php
	}
	add_action( 'wp_head', 'launch_render_title' );
}

// Registering and enqueuing scripts/stylesheets to header/footer.
function launch_scripts() {
  wp_enqueue_style( 'launch_style', get_stylesheet_uri());
	wp_enqueue_style( 'luunch_source_sans_pro', '//fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,700');;
  wp_enqueue_script( 'launch_jquery', 'https://code.jquery.com/jquery-2.1.1.min.js','','',true);

	wp_register_script( 'launch_main', get_template_directory_uri() . '/assets/scripts/main.js', array( 'jquery' ),'',true);
	/// Localize the script with Siteurl
	$url_array = array(
		'adminurl' => admin_url(),
	);
	wp_localize_script( 'launch_main', 'URLARRAY', $url_array );
	wp_enqueue_script('launch_main');
}

add_action( 'wp_enqueue_scripts', 'launch_scripts' );

// Favion function.
function launch_favicon() {
    $favicon = get_theme_mod('launch_favicon_image', get_template_directory_uri().'/assets/images/favicon.png');
    if(!empty($favicon)) {
        echo '<link href="'.$favicon.'" rel="shortcut icon" type="image/x-icon">';
    }
}
add_action('wp_head', 'launch_favicon');

function launch_mail_endpoint(){
    add_rewrite_endpoint( 'mail_chimp', EP_ROOT );
}
add_action( 'init', 'launch_mail_endpoint' );

function launch_mail_query( $query ){
    if( isset( $query->query_vars['mail_chimp'] ) ){
        include( plugin_dir_path( __FILE__ ) . '/assets/helpers/post-subscribe.php');
        exit;
    }
}
add_action( 'parse_query', 'launch_mail_query' );
